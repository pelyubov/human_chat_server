import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, ConsoleLogger, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import { GraphTraversal, GremlinStatics } from '@Project.Database/graph/gremlin/types';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import type { IChanMeta, IChan } from '@Project.Database/schemas/channel.schema';
import type { IMessageMeta } from '@Project.Database/schemas/message.schema';
import { ChannelVertex, UserVertex } from '@Project.Database/schemas/graph';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ChannelId, Long, UserId } from '@Project.Utils/types';
import { WsGateway } from '../ws/ws.gateway';
import { UserManagerService } from './user-manager.service';
import { VertexProperty } from '@Project.Database/graph/gremlin/lib/types';

@Injectable()
export class ChannelManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(forwardRef(() => UserManagerService))
    private readonly users: UserManagerService,
    @Inject(forwardRef(() => WsGateway))
    private readonly ws: WsGateway,
    private readonly logger: ConsoleLogger,
    private readonly cql: CqlDbContext,
    private readonly gremlin: GremlinDbContext,
    private readonly snowflake: SnowflakeService
  ) {
    this.logger.log('ChannelManagerService initialized', 'ChannelManagerService');
  }

  get model() {
    return this.cql.model('Channels') as ModelInstance<IChanMeta>;
  }

  get graph() {
    return this.gremlin.g;
  }

  async get(channelId: ChannelId) {
    const cached = await this.cache.get<IChan>(`chan:${channelId}`);
    if (cached) {
      return cached;
    }
    return await this.fetch(channelId);
  }

  async getChannelVertex(source: GraphTraversal<any, ChannelVertex>, channelId: ChannelId) {
    const result = (await source.hasLabel('Channel').has('channelId', channelId).next()).value;
    if (!result) throw new BadRequestException('Channel does not exist');
    return result;
  }

  async fetch(channelId: ChannelId) {
    const chanMeta = await this.model.findOneAsync({ chan_id: channelId }, { raw: true });
    if (!chanMeta) return null;
    const chanVert = await this.getChannelVertex(this.graph.V(), channelId);
    const users = await this.graph
      .V(chanVert.id)
      .in_<UserVertex>('channelMember')
      .hasLabel('User')
      .properties<VertexProperty<Long>>('userId')
      .toList();
    const chanData: IChan = {
      chan_id: channelId,
      name: chanMeta.name,
      users: users.map((u) => u.value.toBigInt())
    };
    this.logger.debug(chanData, 'ChannelManagerService.fetch.users');
    this.cache.set(`chan:${channelId}`, chanData);
    return chanData;
  }

  async create(name: string, users: UserId[], owner?: UserId) {
    const userVerticesId: Array<[Long, boolean?]> = await Promise.all(
      users.map(async (uid) => {
        const userVertex = await this.users.getUserVertex(this.graph.V(), uid);
        if (!userVertex) throw new BadRequestException('User not found');
        return [userVertex.id, owner?.eq(uid)];
      })
    );

    const channelId = this.snowflake.next();
    const chan = new this.model({ chan_id: channelId, name });
    try {
      await chan.saveAsync(),
        await this.graph.addV('Channel').property('channelId', channelId).next(),
        await Promise.all([
          ...userVerticesId.map(async ([uVertId, isOwner]) => {
            let traversal = this.graph
              .V()
              .hasId(uVertId)
              .addE('channelMember')
              .to(
                GremlinStatics.V<ChannelVertex>().hasLabel('Channel').has('channelId', channelId)
              );
            if (isOwner) {
              traversal = traversal.property('owner', true);
            }
            await traversal.next();
          })
        ]);
      const recipients = users.map((u) => u.toBigInt());
      this.ws.broadcast('channelJoined', { channelId }, recipients);
      this.ws.broadcast(
        'channelMetadata',
        {
          channelId,
          owner: owner?.toBigInt(),
          name: chan.name,
          members: recipients
        },
        recipients
      );
      return <IChan>{
        chan_id: channelId,
        name,
        users: recipients
      };
    } catch (e) {
      // Clean up / delete the channel if it fails
      this.logger.error(e, 'UserManagerService.createUser');
      throw e;
    }
  }

  async delete(channelId: ChannelId) {
    const channel = await this.model.findOneAsync({ chan_id: channelId });
    if (!channel) throw new BadRequestException('Channel not found');
    const channelVertex = await this.getChannelVertex(this.graph.V(), channelId);
    const users = await this.getChannelMembers(channelId);
    await this.graph.V(channelVertex.id).drop().iterate();
    this.cache.del(`chan:${channelId}`);
    this.ws.broadcast('channelLeave', { channelId }, users);
  }

  async update(channelId: ChannelId, data: Partial<Omit<IChanMeta, 'chan_id'>>) {
    const chan = await this.model.findOneAsync({ chan_id: channelId });
    if (!chan) throw new BadRequestException('User not found');
    if (data.name) {
      chan!.name = data.name;
    }
    if (!chan.isModified('name')) return chan as IChanMeta;
    this.cache.del(`chan:${channelId}`);
    return (await chan.saveAsync()) as IChanMeta;
  }

  async join(userId: UserId, channelId: ChannelId) {
    const channel = await this.getChannelVertex(this.graph.V(), channelId);
    if (!channel) throw new BadRequestException('Channel not found');
    const user = await this.users.getUserVertex(this.graph.V(), userId);
    if (!user) throw new BadRequestException('User not found');
    await this.graph
      .V(user.id)
      .addE('channelMember')
      .to(GremlinStatics.V<ChannelVertex>().hasId(channel.id))
      .next();
    this.ws.broadcast(
      'channelJoined',
      { channelId, userId },
      await this.getChannelMembers(channelId)
    );
  }

  async leave(userId: UserId, channelId: ChannelId) {
    const user = await this.users.getUserVertex(this.graph.V(), userId);
    const channel = await this.getChannelVertex(this.graph.V(), channelId);
    await this.graph
      .V(user.id)
      .outE('channelMember')
      .where(GremlinStatics.inV<ChannelVertex>().hasId(channel.id))
      .drop()
      .iterate();

    this.ws.broadcast(
      'channelLeave',
      {
        channelId,
        userId
      },
      (await this.getChannelMembers(channelId)).add(userId.toBigInt())
    );
  }

  async getChannelMembers(channelId: ChannelId): Promise<Set<bigint>> {
    const channel = await this.get(channelId);
    if (!channel) throw new BadRequestException('Channel not found');
    return new Set(channel.users);
  }

  async isOwner(userId: UserId, channelId: ChannelId) {
    const userVertex = await this.users.getUserVertex(this.graph.V(), userId);
    const chanVertex = await this.getChannelVertex(this.graph.V(), channelId);
    const edge = await this.graph
      .V(userVertex.id)
      .outE('channelMember')
      .where(GremlinStatics.inV<ChannelVertex>().hasId(chanVertex.id))
      .next();

    return edge.value.properties.owner;
  }

  async sendMessage(channelId: ChannelId, userId: UserId, message: IMessageMeta) {
    const { content, reply_to, last_edit, message_id } = message;
    const data = {
      messageId: message_id,
      userId,
      channelId,
      replyTo: reply_to,
      content,
      lastEdit: last_edit
    };

    this.broadcastEvent('message', data, channelId);
  }

  async broadcastEvent(event: string, data: any, channelId: ChannelId) {
    this.ws.broadcast(event, data, await this.getChannelMembers(channelId));
  }
}

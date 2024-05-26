import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConsoleLogger,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import { GraphTraversal, GremlinStatics } from '@Project.Database/graph/gremlin/types';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import type { IChanMeta, IChan } from '@Project.Database/schemas/channel.schema';
import type { IMessageMeta } from '@Project.Database/schemas/message.schema';
import { ChannelVertex, UserVertex } from '@Project.Database/schemas/graph';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ChannelId, Long, Nullable, UserId } from '@Project.Utils/types';
import { WsGateway } from '../ws/ws.gateway';
import { UserManagerService } from './user-manager.service';
import { VertexProperty } from '@Project.Database/graph/gremlin/lib/types';
import { IInvite } from '@Project.Database/schemas/invites.schema';
import { base64Number } from '@Project.Utils/helpers';
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';

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

  get channelModel() {
    return this.cql.model('Channels') as ModelInstance<IChanMeta>;
  }

  get inviteModel() {
    return this.cql.model('Invites') as ModelInstance<IInvite>;
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
    if (!result) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
    return result;
  }

  async fetch(channelId: ChannelId) {
    const chanMeta = await this.channelModel.findOneAsync({ chan_id: channelId }, { raw: true });
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
    let ownerVertId: Nullable<Long> = null;
    if (owner) {
      const ownerVert = await this.users.getUserVertex(this.graph.V(), owner);
      ownerVertId = ownerVert.id;
    }

    const userVerticesId = await Promise.all(
      users.map(async (uid) => {
        const userVertex = await this.users.getUserVertex(this.graph.V(), uid);
        if (!userVertex) {
          throw new BadRequestException(ExceptionStrings.UNKNOWN_USER);
        }
        return userVertex.id;
      })
    );

    const channelId = this.snowflake.next();
    const chan = new this.channelModel({ chan_id: channelId, name });

    try {
      await chan.saveAsync();
      const { value: channnelVertex } = await this.graph
        .addV('Channel')
        .property('channelId', channelId)
        .next();

      if (!channnelVertex) {
        throw new InternalServerErrorException('Failed to create channel');
      }
      let traversal = this.graph.V(channnelVertex.id);
      if (ownerVertId) {
        traversal = traversal
          .addE('channelMember')
          .from_(GremlinStatics.V<UserVertex>(ownerVertId))
          .property('owner', true);
      }
      await userVerticesId
        .reduce((traversal, uVertId) => {
          return traversal
            .V(channnelVertex.id)
            .addE('channelMember')
            .from_(GremlinStatics.V<UserVertex>(uVertId));
        }, traversal)
        .iterate();
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

  async createInvite(userId: UserId, channelId: ChannelId, ttl?: number) {
    const inviteId = this.snowflake.next();
    const code = base64Number(inviteId);
    const channel = await this.get(channelId);
    if (!channel) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
    const user = await this.users.get(userId);
    if (!user) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_USER);
    }
    if (!channel.users.includes(userId.toBigInt())) {
      throw new BadRequestException(ExceptionStrings.NOT_MEMBER);
    }
    const data: IInvite = {
      code,
      chan_id: channelId,
      creator_id: userId
    };
    await new this.inviteModel(data).saveAsync({
      ttl
    });
    return code;
  }

  async useInvite(userId: UserId, code: string) {
    const invite = await this.inviteModel.findOneAsync({ code });
    if (!invite) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_INVITE);
    }
    await this.join(userId, invite.chan_id);
  }

  async delete(channelId: ChannelId) {
    const channel = await this.channelModel.findOneAsync({ chan_id: channelId });
    if (!channel) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
    const channelVertex = await this.getChannelVertex(this.graph.V(), channelId);
    const users = await this.getChannelMembers(channelId);
    await this.graph.V(channelVertex.id).drop().iterate();
    this.channelModel.deleteAsync({ chan_id: channelId });
    // ? The moral question of whether to also delete the messages...
    this.cache.del(`chan:${channelId}`);
    this.ws.broadcast('channelLeave', { channelId }, users);
  }

  async update(channelId: ChannelId, data: Partial<Omit<IChanMeta, 'chan_id'>>) {
    const chan = await this.channelModel.findOneAsync({ chan_id: channelId });
    if (!chan) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
    if (data.name) {
      chan!.name = data.name;
    }
    if (!chan.isModified('name')) return chan as IChanMeta;
    this.cache.del(`chan:${channelId}`);
    return (await chan.saveAsync()) as IChanMeta;
  }

  async join(userId: UserId, channelId: ChannelId) {
    const channel = await this.get(channelId);
    if (!channel) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
    if (channel.users.includes(userId.toBigInt())) {
      throw new BadRequestException(ExceptionStrings.ALREADY_MEMBER);
    }
    const channelVertex = await this.getChannelVertex(this.graph.V(), channelId);
    const userVertex = await this.users.getUserVertex(this.graph.V(), userId);
    await this.graph
      .V(userVertex.id)
      .addE('channelMember')
      .to(GremlinStatics.V<ChannelVertex>(channelVertex.id))
      .next();
    this.ws.broadcast(
      'channelJoined',
      { channelId, userId },
      await this.getChannelMembers(channelId)
    );
  }

  async leave(userId: UserId, channelId: ChannelId) {
    const userVertex = await this.users.getUserVertex(this.graph.V(), userId);
    const channelVertex = await this.getChannelVertex(this.graph.V(), channelId);
    await this.graph
      .V(userVertex.id)
      .outE('channelMember')
      .where(GremlinStatics.inV<ChannelVertex>().hasId(channelVertex.id))
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
    if (!channel) {
      throw new BadRequestException(ExceptionStrings.UNKNOWN_CHANNEL);
    }
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

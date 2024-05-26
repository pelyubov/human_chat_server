import { BadRequestException, ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import type {
  ModelInstance,
  ModelQueryResult
} from '@Project.Database/cql/express-cassandra/helpers';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import type { IUserMeta, IUserInfo } from '@Project.Database/schemas/user.schema';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ISignUpDto } from '@Project.Dtos/user/signup.dto';
import { Nullable, UserId, Long, ChannelId } from '@Project.Utils/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IUpdateUserDto } from '@Project.Dtos/user/update-user.dto';
import { GremlinStatics } from '@Project.Database/graph/gremlin/types';
import { WsGateway } from '../ws/ws.gateway';
import { GraphTraversal } from '@Project.Database/graph/gremlin/lib/graph-traversal';
import {
  ChannelVertex,
  FriendRelationshipEdge,
  FriendRelationshipStatus,
  UserVertex
} from '@Project.Database/schemas/graph';

@Injectable()
export class UserManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly ws: WsGateway,
    private readonly logger: ConsoleLogger,
    private readonly cqlDb: CqlDbContext,
    private readonly gremlin: GremlinDbContext,
    private readonly snowflake: SnowflakeService
  ) {
    this.logger.log('UserManagerService initialized', 'UserManagerService');
  }
  get model() {
    return this.cqlDb.model('Users') as ModelInstance<IUserMeta>;
  }
  get graph() {
    return this.gremlin.g;
  }
  async retrieveUserId(username: string) {
    const result = await this.model.findOneAsync(
      { username },
      { select: ['user_id'], raw: true, allow_filtering: true }
    );
    if (!result) return null;
    return Long.fromILong(result.user_id);
  }
  async get(userId: UserId) {
    const cached = await this.cache.get<IUserInfo>(`user:${userId}:meta`);
    if (cached) {
      return cached;
    }
    return await this.fetch(userId);
  }
  async fetch(userId: UserId): Promise<Nullable<IUserInfo>> {
    const result = await this.model.findOneAsync(
      { user_id: userId },
      { select: ['display_name', 'username'] }
    );
    if (!result) return null;
    result.user_id = userId;
    this.cache.set(`user:${userId}:meta`, result);
    return result;
  }
  async create(data: ISignUpDto) {
    const { email, username, password, displayName } = data;
    const credentials = await hash(password, 10);
    const id = this.snowflake.next();
    const user = new this.model({
      user_id: id,
      email,
      display_name: displayName || username,
      username,
      credentials,
      bio: ''
    });
    try {
      await user.saveAsync();
      await this.graph.addV('User').property('userId', id).next();
    } catch (e) {
      this.logger.error(e, 'UserManagerService.createUser');
      throw e;
    }
  }
  async update(userId: UserId, data: IUpdateUserDto) {
    const target = await this.model.findOneAsync({ user_id: userId });
    if (!target) throw new BadRequestException('User not found');
    const { email, password, oldPassword, username, displayName, bio } = data;
    if (email || password) {
      await this.updateAuth(target, { email, password, oldPassword });
    } else {
      if (username) {
        if (await this.existsUsername(username))
          throw new BadRequestException('Username already exists.');
        target.username = username;
      }
      if (displayName) target.display_name = displayName;
      if (bio) target.bio = bio;
      if (
        !target.isModified('username') &&
        !target.isModified('display_name') &&
        !target.isModified('bio')
      )
        return target as IUserMeta;
    }

    await target.saveAsync();

    const out: IUserInfo = {
      user_id: target.user_id,
      display_name: target.display_name,
      username: target.username,
      bio: target.bio
    };

    this.invalidateCache(userId);

    return out as IUserMeta;
  }
  async updateAuth(
    target: ModelQueryResult<IUserMeta>,
    data: { email?: string; password?: string; oldPassword?: string }
  ) {
    const { email, password, oldPassword } = data;
    if (!oldPassword) {
      // User can only update email in this case.
      if (!email || email === target.email) throw new BadRequestException('No changes detected.');
      if (await this.existsEmail(email)) throw new BadRequestException('Email already exists.');
      if (!password) throw new BadRequestException('Password is required when changing email.');
      if (!(await compare(password, target.credentials)))
        throw new BadRequestException('Password is incorrect.');
      target.email = email;
    } else {
      if (!(await compare(oldPassword, target.credentials)))
        throw new BadRequestException('Password is incorrect.');
      if (!password)
        throw new BadRequestException('New password is required when changing password.');
      target.credentials = await hash(password, 10);
    }
  }
  async delete(userId: UserId) {
    const user = await this.model.findOneAsync({ user_id: userId });
    if (!user) throw new BadRequestException('User not found');
    user.email = '';
    user.username = `${userId}-del`;
    user.display_name = `Deleted User ${userId}`;
    user.credentials = '';
    user.bio = '';
    const userVertex = await this.getUserVertex(this.graph.V(), userId);
    await user.saveAsync();
    await this.graph.V(userVertex.id).outE().drop().iterate();
    await this.graph.V(userVertex.id).inE().drop().iterate();
    await this.invalidateCache(userId);
  }

  async existsEmail(email: string) {
    return !!(await this.model.findOneAsync(
      { email },
      { select: ['email'], allow_filtering: true }
    ));
  }
  async existsUsername(username: string) {
    return !!(await this.model.findOneAsync(
      { username },
      { select: ['username'], allow_filtering: true }
    ));
  }
  async invalidateCache(userId: UserId) {
    this.cache.del(`user:${userId}`);
    this.cache.del(`user:${userId}:meta`);
    this.cache.del(`user:${userId}:vertId`);
  }

  async fetchChannelIds(userId: UserId) {
    const userVertex = await this.getUserVertex(this.graph.V(), userId);
    const result = await this.graph
      .V(userVertex.id)
      .out<ChannelVertex>('channelMember')
      .values('channelId')
      .toList();
    return result as unknown as ChannelId[];
  }

  async getUserVertex(traversal: GraphTraversal<any, UserVertex>, userId: UserId) {
    const cached = await this.cache.get<UserVertex>(`user:${userId}:vertex`);
    if (cached) return cached;
    const result = (await traversal.hasLabel('User').has('userId', userId).next()).value;
    if (!result) throw new BadRequestException('User not found');
    this.cache.set(`user:${userId}:vertex`, result);
    return result;
  }

  private async getRelationship(
    fromVertexId: Long,
    toVertexId: Long
  ): Promise<Nullable<FriendRelationshipStatus>> {
    const result: Nullable<FriendRelationshipEdge> = (
      await this.gremlin.getEdge(fromVertexId, toVertexId, 'relationship').next()
    ).value;
    return result?.properties.relationshipStatus;
  }

  async sendRequest(senderUID: UserId, receiverUID: UserId) {
    const { id: senderId } = await this.getUserVertex(this.graph.V(), senderUID);
    const { id: receiverId } = await this.getUserVertex(this.graph.V(), receiverUID);
    const outgoingRelationship = await this.getRelationship(senderId, receiverId);
    this.logger.debug(JSON.stringify(outgoingRelationship), 'outgoingRelationship');
    const incomingRelationship = await this.getRelationship(receiverId, senderId);
    this.logger.debug(JSON.stringify(incomingRelationship), 'incomingRelationship');
    switch (incomingRelationship) {
      case 'BLOCKED':
        throw new BadRequestException('This user has blocked you.');
      case 'FRIEND':
        throw new BadRequestException('You are already friends with this user.');
      case 'PENDING':
        throw new BadRequestException('You have already received a friend request from this user.');
    }
    switch (outgoingRelationship) {
      case 'BLOCKED':
        throw new BadRequestException('You blocked this user.');
      case 'FRIEND':
        throw new BadRequestException('You are already friends with this user.');
      case 'PENDING':
        throw new BadRequestException('You have already sent a friend request to this user.');
    }

    await this.graph
      .V(senderId)
      .addE('relationship')
      .to(GremlinStatics.V<UserVertex>(receiverId))
      .property('relationshipStatus', 'PENDING')
      .next();

    this.ws.broadcast(
      'incomingFriendRequest',
      {
        from: senderUID
      },
      [receiverId.toBigInt()]
    );
  }

  async acceptRequest(responderUID: UserId, requesterUID: UserId) {
    const responderVertex = await this.getUserVertex(this.graph.V(), responderUID);
    const requesterVertex = await this.getUserVertex(this.graph.V(), requesterUID);
    const responderVertexId = responderVertex.id;
    const requesterVertexId = requesterVertex.id;
    const outgoingRelationship = await this.getRelationship(responderVertexId, requesterVertexId);
    const incomingRelationship = await this.getRelationship(requesterVertexId, responderVertexId);
    switch (outgoingRelationship) {
      case 'BLOCKED':
        throw new BadRequestException('You blocked this user.');
      case 'FRIEND':
        throw new BadRequestException('You are already friends with this user.');
      case 'PENDING':
        throw new BadRequestException('You cannot accept a friend request that you sent.');
    }
    switch (incomingRelationship) {
      case 'BLOCKED':
        throw new BadRequestException('This user has blocked you.');
      case 'FRIEND':
        throw new BadRequestException('You are already friends with this user.');
      case 'PENDING':
        await Promise.all([
          this.graph
            .V(responderVertexId)
            .addE('relationship')
            .to(GremlinStatics.V<UserVertex>(requesterVertexId))
            .property('relationshipStatus', 'FRIEND')
            .next(),
          this.graph
            .V(requesterVertexId)
            .outE('relationship')
            .where(GremlinStatics.inV<UserVertex>().hasId(responderVertexId))
            .property('relationshipStatus', 'FRIEND')
            .next()
        ]);

        this.ws.broadcast('friendRequestAccepted', { from: requesterUID }, [
          responderUID.toBigInt()
        ]);
        break;
    }
  }

  async cancelRequest(senderUID: UserId, receiverUID: UserId) {
    const { id: senderVertexId } = await this.getUserVertex(this.graph.V(), senderUID);
    const { id: receiverVertexId } = await this.getUserVertex(this.graph.V(), receiverUID);
    const outgoingRelationship = await this.getRelationship(senderVertexId, receiverVertexId);
    switch (outgoingRelationship) {
      case 'BLOCKED':
      case 'FRIEND':
        throw new BadRequestException("You don't have a pending friend request to this user.");
      case 'PENDING':
        await this.graph
          .V(senderVertexId)
          .outE('relationship')
          .where(GremlinStatics.inV<UserVertex>().hasId(receiverVertexId))
          .drop()
          .iterate();
        break;
    }
  }

  async getOutgoingRequests(userId: UserId): Promise<UserId[]> {
    const userVertex = await this.getUserVertex(this.graph.V(), userId);
    return await this.graph
      .V(userVertex.id)
      .outV()
      .has('relationshipStatus', FriendRelationshipStatus.PENDING)
      .values<UserId>('userId')
      .toList();
  }

  async getIncomingRequests(userId: UserId): Promise<UserId[]> {
    const userVertex = await this.getUserVertex(this.graph.V(), userId);
    return await this.graph
      .V(userVertex.id)
      .inV()
      .has('relationshipStatus', FriendRelationshipStatus.PENDING)
      .values<UserId>('userId')
      .toList();
  }

  async unfriend(senderUID: UserId, receiverUID: UserId) {
    const { id: senderVertexId } = await this.getUserVertex(this.graph.V(), senderUID);
    const { id: receiverVertexId } = await this.getUserVertex(this.graph.V(), receiverUID);
    const outgoingRelationship = await this.getRelationship(senderVertexId, receiverVertexId);

    if (outgoingRelationship !== 'FRIEND') {
      throw new BadRequestException('You are not friends with this user.');
    }

    await Promise.all([
      this.graph
        .V(senderVertexId)
        .outE('relationship')
        .where(GremlinStatics.inV<UserVertex>().hasId(receiverVertexId))
        .drop()
        .iterate(),
      this.graph
        .V(receiverVertexId)
        .outE('relationship')
        .where(GremlinStatics.inV<UserVertex>().hasId(senderVertexId))
        .drop()
        .iterate()
    ]);

    this.ws.broadcast('unfriended', { from: receiverUID }, [senderUID.toBigInt()]);
  }

  async block(senderUID: UserId, receiverUID: UserId) {
    const { id: senderVertexId } = await this.getUserVertex(this.graph.V(), senderUID);
    const { id: receiverVertexId } = await this.getUserVertex(this.graph.V(), receiverUID);
    const outgoingRelationship = await this.getRelationship(senderVertexId, receiverVertexId);
    const incomingRelationship = await this.getRelationship(receiverVertexId, senderVertexId);
    switch (outgoingRelationship) {
      case 'BLOCKED':
        throw new BadRequestException('You have already blocked this user.');
      case 'FRIEND':
        await this.unfriend(senderUID, receiverUID);
        break;
      case 'PENDING':
        await this.cancelRequest(senderUID, receiverUID);
        break;
    }
    if (incomingRelationship === 'PENDING') {
      await this.cancelRequest(receiverUID, senderUID);
    }
    await this.graph
      .V(senderVertexId)
      .addE('relationship')
      .to(GremlinStatics.V<UserVertex>(receiverVertexId))
      .property('relationshipStatus', 'BLOCKED')
      .next();

    this.ws.broadcast('blocked', { from: senderUID }, [receiverUID.toBigInt()]);
  }
}

export enum RelationEdgeSchema {
  name = 'FriendRelation',
  status = 'status'
}

export enum UserVerticleSchema {
  name = 'User',
  userId = 'userId'
}

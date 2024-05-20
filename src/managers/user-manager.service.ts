import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import type { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import type { IUser, IUserAuth, IUserMeta } from '@Project.Database/schemas/user.schema';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ISignUpDto } from '@Project.Dtos/signup.dto';
import { Nullable, UserId, Long } from '@Project.Utils/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FriendRelationStatus } from '@Project.Utils/types';

@Injectable()
export class UserManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly logger: ConsoleLogger,
    private readonly cqlDb: CqlDbContext,
    private readonly gremlin: GremlinDbContext,
    private readonly snowflake: SnowflakeService
  ) {
    this.logger.log('UserManagerService initialized', 'UserManagerService');
  }
  get cql() {
    return this.cqlDb.model('Users') as ModelInstance<IUser>;
  }
  get graph() {
    return this.gremlin.g;
  }
  async retrieveUserAuth(email: string) {
    return (await this.cql.findOneAsync(
      { email },
      { select: ['user_id', 'username', 'credentials'], raw: true }
    )) as Nullable<IUserAuth>;
  }
  async retrieveUserId(username: string) {
    return (await this.cql.findOneAsync(
      { username },
      { select: ['user_id'], raw: true }
    )) as Nullable<UserId>;
  }
  async get(userId: UserId) {
    const cached = await this.cache.get<IUserMeta>(`user:${userId}`);
    if (cached) {
      return cached;
    }
    return await this.fetch(userId);
  }
  async fetch(userId: UserId): Promise<Nullable<IUserMeta>> {
    const result = await this.cql.findOneAsync(
      { user_id: userId },
      { select: ['display_name', 'username'] }
    );
    if (!result) return null;
    result.user_id = Long.fromILong(result.user_id);
    this.cache.set(`user_meta:${userId}`, result);
    return result;
  }
  async createUser(data: ISignUpDto) {
    const { email, username, password, displayName } = data;
    const credentials = await hash(password, 10);
    const id = this.snowflake.next();
    const user = new this.cql({
      user_id: id,
      email,
      display_name: displayName || username,
      username,
      credentials,
      bio: ''
    });
    try {
      await user.saveAsync();
      await this.graph.addV('User').property('id', id).next();
    } catch (e) {
      this.logger.error(e, 'UserManagerService.createUser');
      throw e;
    }
  }
  async existsEmail(email: string) {
    return !!(await this.cql.findOneAsync({ email }, { select: ['email'] }));
  }
  async existsUsername(username: string) {
    return !!(await this.cql.findOneAsync(
      { username },
      { select: ['username'], allow_filtering: true }
    ));
  }
  async invalidateCache(userId: UserId) {
    this.cache.del(`user:${userId}`);
  }
  async fetchChannels(userId: UserId) {
    const result = await this.graph.V(userId).out('member').values('id').toList();
  }
  async friendRequest(from: UserId, to: UserId) {
    const fromUserGraph = this.graph.V().has('user_id', from);
    const toUserGraph = this.graph.V().has('user_id', to);
    fromUserGraph.addE('relation').to(toUserGraph).property('friend', FriendRelationStatus.PENDING);
  }
  async deleteFriendRequest(from: UserId, to: UserId) {
    // TODO
  }
}

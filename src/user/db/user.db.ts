import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
import GraphDBContext, { GraphTraversalSource } from 'src/core/db/graph.db';
import KafkaDbContext from 'src/core/db/kafka.db';
import TableDbContext from 'src/core/db/table.db';
import { CreateUserDto } from '../dtos/createUser.dto';
import { UpdateUserDto } from '../dtos/updateUser.dto';
import User from '../entities/user.enity';

type QueriesFieldGetUser = {
  id?: BigInt;
  name?: string;
  email?: string;
};

type OutputFieldGetUser = {
  id?: BigInt;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  status?: boolean;
  isDeleted?: boolean;
};

type UserId = BigInt;
type FriendId = BigInt;

interface IUserDbContext {
  getUsersByContainSubKeyword<O = OutputFieldGetUser>(
    queries: QueriesFieldGetUser,
    outputField: O,
  ): Promise<any>;
  getUser(userId: UserId): Promise<User>;
  createUser(user: User): Promise<UserId>;
  updateUser(user: User): Promise<UserId>;
  deleteUser(userId: UserId): Promise<UserId>;
  getFriends(userId: UserId): Promise<FriendId[]>;
  getFriendsId(userId: UserId): Promise<FriendId[]>;
}

export default class UserDbContext {
  private static _instance: UserDbContext;
  private tableName = 'users';
  constructor(
    private g?: GraphTraversalSource,
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer,
  ) {
    if (UserDbContext._instance) {
      return UserDbContext._instance;
    }

    UserDbContext._instance = this;
  }

  static get instance(): UserDbContext {
    if (!this._instance) {
      throw new Error('UserDbContext is not initialized');
    }
    return this._instance;
  }

  async getUsersByContainSubKeyword<O = OutputFieldGetUser>(
    queries: QueriesFieldGetUser,
    outputField: O,
  ): Promise<any> {
    // TODO fix to Promise<O>
    const condition = Object.keys(queries)
      .map((key) => `${key} like %${queries[key]}%`)
      .join(' and ');
    const output = Object.keys(outputField)
      .map((key) => `${key} = ${outputField[key]}`)
      .join(', ');
    const query = `Select ${output ?? '*'} from ${this.tableName} ${condition ? ` where ${condition}` : ''};`;
    const result = await this.table.execute(query);
    return Promise.resolve(result.rows[0]);
  }

  async getUser(id: UserId): Promise<any> {
    const result = `Select * from ${this.tableName} where id = ${id};`;
    const user = await this.table.execute(result);
    return user.rows[0];
  }

  async getUserByEmail(email: string): Promise<any> {
    const result = `Select * from ${this.tableName} where email = '${email}';`;
    const user = await this.table.execute(result);
    return user.rows[0];
  }

  async getUsers(ids: UserId[]): Promise<any> {
    let users = [];
    for (const id of ids) {
      const user = await this.getUser(id);
      users.push(user);
    }
    return users;
  }

  deleteUser(userId: UserId): void {
    this.producer.send({
      topic: 'delete-user',
      messages: [{ value: JSON.stringify(userId) }],
    });
  }
  updateUser(userId: UserId, updateUser: UpdateUserDto): void {
    this.producer.send({
      topic: 'update-user',
      messages: [{ value: JSON.stringify({ id: userId, updateUser }) }],
    });
  }
  createUser(newUser: CreateUserDto): void {
    this.producer.send({
      topic: 'create-user',
      messages: [{ value: JSON.stringify(newUser) }],
    });
  }

  getUserByEmailAndPassword(email: string, password: string): Promise<any> {
    const query = `Select * from ${this.tableName} where email = '${email}' and password = '${password}';`;
    return this.table.execute(query);
  }

  private getFriendsId(userId: UserId): FriendId[] {
    const friendsId: FriendId[] = [];
    // TODO complete friends id query
    // this.g
    //   .V()
    //   .hasLabel('User')
    //   .has('id', userId)
    //   .bothE()
    //   .hasLabel('Friend')
    //   .values('friendId')
    //   .forEach((friendId) => {
    //     friendsId.push(friendId);
    //   });
    return friendsId;
  }

  getFriends(userId: UserId): User[] {
    const friendsId = this.getFriendsId(userId);
    const friends = [];
    for (const friendId of friendsId) {
      friends.push(this.getUser(friendId));
    }
    return friends;
  }
}

new UserDbContext(
  GraphDBContext.instance.graph,
  TableDbContext.instance.client,
  KafkaDbContext.instance.producer,
  KafkaDbContext.instance.consumer,
);

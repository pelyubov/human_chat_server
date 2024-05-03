import GraphDBContext from 'src/core/db/graph.db';
import TableDbContext from 'src/core/db/table.db';
import Snowflex from 'src/core/utils/snowflake';
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

type UserId = Snowflex;
type FriendsId = Snowflex;

export default class UserDbContext {
  private static _instance: UserDbContext;
  private tableDb: TableDbContext;
  private graphDb: GraphDBContext;
  private tableName = 'users';
  constructor(tableDb?: TableDbContext, graphDb?: GraphDBContext) {
    if (UserDbContext._instance) {
      return UserDbContext._instance;
    }
    this.tableDb = tableDb;
    this.graphDb = graphDb;
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
    const result = await this.tableDb.client.execute(query);
    return Promise.resolve(result.rows[0]);
  }

  async getUser(id: UserId): Promise<any> {
    const result = `Select * from ${this.tableName} where id = ${id};`;
    const user = await this.tableDb.client.execute(result);
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

  deleteUser(): void {
    throw new Error('Method not implemented.');
  }
  updateUser(): void {
    throw new Error('Method not implemented.');
  }
  createUser(): void {
    throw new Error('Method not implemented.');
  }

  private getFriendsId(userId: BigInt): FriendsId[] {
    // use graph db
    throw new Error('Method not implemented.');
  }

  getFriends(): User[] {
    throw new Error('Method not implemented.');
  }
}

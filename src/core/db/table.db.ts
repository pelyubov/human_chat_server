import { Client } from 'cassandra-driver';
import IDbContext from './db.abstract';
import DbState from './state.db';

const {
  CASSANDRA_HOST: HOST,
  CASSANDRA_PORT: PORT,
  CASSANDRA_LOCAL_DATACENTER: LOCAL_DATACENTER,
  CASSANDRA_KEYSPACE,
} = process.env;

const endpoint = `${HOST}:${PORT}`;

const client = new Client({
  contactPoints: [endpoint],
  localDataCenter: LOCAL_DATACENTER,
  keyspace: CASSANDRA_KEYSPACE,
});

export default class TableDbContext extends IDbContext {
  private _client: Client;
  private static _instance: TableDbContext;

  static get instance(): TableDbContext {
    if (!this._instance) {
      throw new Error('TableDbContext is not initialized');
    }
    return this._instance;
  }

  get client(): Client {
    return this._client;
  }

  constructor(client?: Client) {
    if (TableDbContext._instance) {
      return TableDbContext._instance;
    }
    super();
    this._client = client;
    this.connect();
    TableDbContext._instance = this;
  }

  protected async connect(): Promise<void> {
    if (this.connectionState === DbState.CONNECTED) {
      return;
    }
    this.connectionState = DbState.CONNECTING;
    return new Promise(async (resolve, reject) => {
      try {
        this.connectionState = DbState.CONNECTING;
        await this._client.connect();
        this.connectionState = DbState.CONNECTED;
        this.emit(DbState.CONNECTED);
        resolve();
      } catch (e) {
        this.connectionState = DbState.ERROR;
        this.emit(DbState.ERROR, e);
        reject(e);
      }
    });
  }

  protected async disconnect(): Promise<void> {
    await this._client.shutdown();
  }
}

new TableDbContext(client);

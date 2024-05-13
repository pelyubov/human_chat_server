import { Client } from 'cassandra-driver';
import { config } from 'dotenv';
import IDbContext from './db.abstract';
import DbState from './state.db';
config();

const {
  ADDRESS1: host1,
  ADDRESS2: host2,
  ADDRESS3: host3,
  SCYLLA_PORT: scyllaPort,
  CASSANDRA_LOCAL_DATACENTER: localDatacenter,
  CASSANDRA_KEYSPACE: cassandraKeyspace,
} = process.env;

const contactPoints = [host1, host2, host3].map((host, i) => `${host}:${scyllaPort}`);

const client = new Client({
  contactPoints: contactPoints,
  localDataCenter: localDatacenter,
  keyspace: cassandraKeyspace,
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

  protected test() {}

  protected async disconnect(): Promise<void> {
    await this._client.shutdown();
  }
}

new TableDbContext(client);

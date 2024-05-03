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
  public client: Client;
  private static instance: TableDbContext;

  constructor(client?: Client) {
    if (TableDbContext.instance) {
      return TableDbContext.instance;
    }
    super();
    this.client = client;
    this.connect();
    TableDbContext.instance = this;
  }

  protected async connect(): Promise<void> {
    if (this.connectionState === DbState.CONNECTED) {
      return;
    }
    this.connectionState = DbState.CONNECTING;
    return new Promise(async (resolve, reject) => {
      try {
        this.connectionState = DbState.CONNECTING;
        await this.client.connect();
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
}

new TableDbContext(client);

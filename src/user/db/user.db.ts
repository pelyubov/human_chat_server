import EventEmitter from 'events';
import { User } from '../entities/user.enity';
import { GraphTraversalSource } from 'src/core/db/graph.db';

interface IUserDBContext {
  getUser(): User;
  deleteUser(): void;
  updateUser(): void;
  createUser(): void;
}

enum DbState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'connectError',
  EXECUTE_START = 'executeStart',
  EXECUTE_DONE = 'executeDone'
}

export default class UserDBContext extends EventEmitter implements IUserDBContext {
  private graph: GraphTraversalSource;
  private connectionState = DbState.DISCONNECTED;
  private instance: UserDBContext;
  constructor(graph: GraphTraversalSource) {
    super();
    graph = this.graph;
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
  async connect() {
    if (this.connectionState === DbState.CONNECTED) {
      return;
    }
    try {
      this.connectionState = DbState.CONNECTING;
      await client.connect();
      console.log('Connected to cassandra db');
      this.connectionState = DbState.CONNECTED;
      this.emit(DbState.CONNECTED);
    } catch (e) {
      this.connectionState = DbState.ERROR;
      console.error('Error connecting to cassandra db', e);
      this.emit(DbState.ERROR, e);
      throw e;
    }
  }
  async waitUntilConnected() {
    return new Promise<void>(async (resolve, reject) => {
      if (this.connectionState === DbState.CONNECTED) resolve();
      if (this.connectionState === DbState.DISCONNECTED) reject('Client is disconnected');
      if (this.connectionState === DbState.ERROR) await this.connect();
      const done = () => {
        resolve();
        this.removeListener(DbState.CONNECTED, done);
      };
      this.addListener(DbState.CONNECTED, done);
    });
  }

  async getUser(): User {
    if (this.connectionState !== DbState.CONNECTED) {
      await this.waitUntilConnected();
    }
  }
}

import { EventEmitter } from 'stream';
import DbState from './state.db';

export default abstract class IDbContext extends EventEmitter {
  protected connectionState = DbState.DISCONNECTED;
  protected abstract connect(): Promise<void>;
  protected async waitUntilConnected(eventEmitter: EventEmitter): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (this.connectionState === DbState.CONNECTED) resolve();
      if (this.connectionState === DbState.DISCONNECTED) reject('Client is disconnected');
      if (this.connectionState === DbState.ERROR) await this.connect();
      const done = () => {
        resolve();
        eventEmitter.removeListener(DbState.CONNECTED, done);
      };
      eventEmitter.addListener(DbState.CONNECTED, done);
    });
  }
}

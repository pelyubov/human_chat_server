import { TableName } from './schemas/schema';

export abstract class CqlDbConnectionImpl<Client = unknown> {
  abstract get client(): Client;
  protected abstract init(): Promise<void>;
  protected abstract test(client: Client): Promise<void>;
  public abstract close(): void;
  public abstract reconnect(force?: boolean): Promise<void>;
}

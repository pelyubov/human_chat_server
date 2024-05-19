import { Jsonable } from '@Project.Utils/types';
import { TableName } from './schemas/schema';

export abstract class CqlDbConnectionImpl<Client = unknown> implements Jsonable {
  abstract get client(): Client;
  protected abstract init(): Promise<void>;
  protected abstract test(client: Client): Promise<void>;
  public abstract close(): void;
  public abstract reconnect(force?: boolean): Promise<void>;
  public abstract model<Name extends TableName>(tableName: Name): unknown;
  public abstract toJSON(): Promise<object>;
}

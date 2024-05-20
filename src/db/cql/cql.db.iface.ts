import { Jsonable } from '@Project.Utils/types';
import { TableName } from './schemas/schema';

export abstract class CqlDbConnectionImpl<Client = unknown> implements Jsonable {
  abstract get client(): Client;
  protected abstract init(): Promise<void>;
  protected abstract test(client: Client): Promise<void>;
  abstract close(): void;
  abstract reconnect(force?: boolean): Promise<void>;
  abstract model<Name extends TableName>(tableName: Name): unknown;
  abstract toJSON(): Promise<object>;
}

import type { ITest } from './test.schema';
import type { IMessage } from './message.schema';
import { IUser } from './user.schema';

export type AllSchemas = {
  Test: ITest;
  Users: IUser;
  Messages: IMessage;
};

export type TableName = keyof AllSchemas;

export type Schema<TableName> = {
  [T in keyof AllSchemas]: TableName extends T ? AllSchemas[T] : Record<string, never>;
}[keyof AllSchemas];

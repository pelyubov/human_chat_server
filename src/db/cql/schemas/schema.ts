import type { TestModel } from './test.schema';
import type { MessageModel } from './message.schema';
import { UserModel } from './users.schema';

export type AllSchemas = {
  Test: TestModel;
  Users: UserModel;
  Messages: MessageModel;
};

export type TableName = keyof AllSchemas;

export type Schema<TableName> = {
  [T in keyof AllSchemas]: TableName extends T ? AllSchemas[T] : Record<string, never>;
}[keyof AllSchemas];

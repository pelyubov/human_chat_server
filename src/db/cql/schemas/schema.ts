import type { TestModel } from './test.schema';
import type { AuthModel } from './auth.schema';
import type { UserModel } from './user.schema';
import type { MessageModel } from './message.schema';
import { UsersModel } from './users.schema';

export type AllSchemas = {
  Test: TestModel;
  Auth: AuthModel;
  User: UserModel;
  Users: UsersModel;
  Message: MessageModel;
};

export type TableName = keyof AllSchemas;

export type Schema<TableName> = {
  [T in keyof AllSchemas]: TableName extends T ? AllSchemas[T] : Record<string, never>;
}[keyof AllSchemas];

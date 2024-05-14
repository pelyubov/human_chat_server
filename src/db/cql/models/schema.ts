import type { TestModel } from './test.model';
import type { AuthModel } from './auth.model';
import type { UserModel } from './users.model';
import { MessageModel } from './message.model';

type AllSchemas = {
  test: TestModel;
  auth: AuthModel;
  user: UserModel;
  message: MessageModel;
};

export type TableName = keyof AllSchemas;

export type Schema<TableName> = {
  [T in keyof AllSchemas]: TableName extends T ? AllSchemas[T] : never;
}[keyof AllSchemas];

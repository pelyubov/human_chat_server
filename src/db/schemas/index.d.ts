import type { ITest } from './test.schema';
import type { IMessageMeta } from './message.schema';
import { IUserMeta } from './user.schema';
import { IChanMeta } from './channel.schema';
import { IInvite } from './invites.schema';

export type AllSchemas = {
  Test: ITest;
  Users: IUserMeta;
  Messages: IMessageMeta;
  Channels: IChanMeta;
  Invites: IInvite;
};

export type TableName = keyof AllSchemas;

export type Schema<TableName> = {
  [T in keyof AllSchemas]: TableName extends T ? AllSchemas[T] : Record<string, never>;
}[keyof AllSchemas];

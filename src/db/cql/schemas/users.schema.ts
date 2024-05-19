import { Nullable, UserId } from '@Project.Utils/types';

export interface IUser {
  user_id: UserId;
  email: string;
  credentials: string;
  username: string;
  display_name: Nullable<string>;
  bio: string;
}

export interface IUserAuth {
  user_id: bigint;
  username: string;
  credentials: string;
}

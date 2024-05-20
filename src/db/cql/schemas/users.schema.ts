import { Long, UserId } from '@Project.Utils/types';

export interface IUser {
  user_id: UserId;
  email: string;
  credentials: string;
  username: string;
  display_name: string;
  bio: string;
}

export interface IUserAuth {
  user_id: UserId;
  username: string;
  credentials: string;
}

export interface IUserMeta {
  user_id: Long;
  display_name: string;
  username: string;
  bio: string;
  channels: Set<bigint>;
}

import { ChannelId, UserId } from '@Project.Utils/types';

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
  user_id: UserId;
  display_name: string;
  username: string;
  bio: string;
}

export interface IUserChanMeta {
  channels: Set<ChannelId>;
}

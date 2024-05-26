import { ChannelId, UserId } from '@Project.Utils/types';
import { FriendRelationshipStatus } from './graph';

export interface IUserAuth {
  email: string;
  user_id: UserId;
  username: string;
  credentials: string;
}

export interface IUserInfo {
  user_id: UserId;
  display_name: string;
  username: string;
  bio: string;
}

export interface IUserMeta extends IUserAuth, IUserInfo {}

export interface IUserChanMeta {
  channels: Set<ChannelId>;
}

export interface IUserRelation {
  against: UserId;
  status: FriendRelationshipStatus;
}

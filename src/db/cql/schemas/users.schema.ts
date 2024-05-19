import { Nullable, UserId } from '@Project.Utils/types';

export interface UsersModel {
  user_id: UserId;
  email: string;
  credentials: string;
  username: string;
  display_name: Nullable<string>;
  bio: string;
}

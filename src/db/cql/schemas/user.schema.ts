import { Nullable, UserId } from '@Project.Utils/types';

export interface UserModel {
  user_id: UserId;
  username: string;
  display_name: Nullable<string>;
  bio: string;
}

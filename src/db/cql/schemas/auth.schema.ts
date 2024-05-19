import { UserId } from '@Project.Utils/types';

export interface AuthModel {
  user_id: UserId;
  email: string;
  credentials: string;
}

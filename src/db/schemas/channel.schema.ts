import { UserId } from '@Project.Utils/types';

export interface IChan {
  id: string;
  name: string;
  users: Set<UserId>;
}

export interface IChanMeta {
  id: string;
  users: Set<UserId>;
}

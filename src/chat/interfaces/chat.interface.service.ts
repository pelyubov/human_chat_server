import { User } from 'src/user/entities/user.enity';
import { Group } from '../../entities/chat.entity';
export interface IChatService {
  create(id: bigint, name: string, avatar: string, members: User[]): Promise<boolean>;
  get(id: bigint): Promise<Group>;
  update(id: bigint, name: string, avatar: string): Promise<boolean>;
  delete(id: bigint): Promise<boolean>;
  getChatList(userID: bigint): Promise<Group[]>;
  getUserInGroup(groupID: bigint): Promise<User[]>;
}

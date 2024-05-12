import { User } from 'src/user/entities/user.enity';
import { GroupChat } from '../entities/chat.entity';
export interface IChatService {
  create(id: bigint, name: string, avatar: string, members: User[]): Promise<boolean>;
  get(id: bigint): Promise<GroupChat>;
  update(id: bigint, name: string, avatar: string): Promise<boolean>;
  delete(id: bigint): Promise<boolean>;
  getChatList(userID: bigint): Promise<GroupChat[]>;
  getUserInGroup(groupID: bigint): Promise<User[]>;
}

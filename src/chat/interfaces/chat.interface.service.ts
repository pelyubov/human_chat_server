import GroupChat from 'src/chat/entities/groupchat';
import User from 'src/user/entities/user.enity';
export interface IChatService {
  create(id: BigInt, name: string, avatar: string, members: User[]): Promise<boolean>;
  get(id: BigInt): Promise<GroupChat>;
  update(id: BigInt, name: string, avatar: string): Promise<boolean>;
  delete(id: BigInt): Promise<boolean>;
  getChatList(userID: BigInt): Promise<GroupChat[]>;
  getUserInGroup(groupID: BigInt): Promise<User[]>;
}

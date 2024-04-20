import { Injectable } from '@nestjs/common';
import { IChatService } from './interfaces/chat.interface.service';
import { GroupChat } from 'src/chat/entities/groupchat';
import { User } from 'src/user/entities/user';

@Injectable()
export class ChatService implements IChatService {
  create(id: BigInt, name: string, avatar: string, members: User[]): Promise<boolean> {
    WebSocket;
    throw new Error('Method not implemented.');
  }
  get(id: BigInt): Promise<GroupChat> {
    throw new Error('Method not implemented.');
  }
  update(id: BigInt, name: string, avatar: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: BigInt): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getChatList(userID: BigInt): Promise<GroupChat[]> {
    throw new Error('Method not implemented.');
  }
  getUserInGroup(groupID: BigInt): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

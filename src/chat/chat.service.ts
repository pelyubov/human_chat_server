import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.enity';
import { GroupChat } from './entities/chat.entity';
import { IChatService } from './interfaces/chat.interface.service';

@Injectable()
export class ChatService implements IChatService {
  create(id: BigInt, name: string, avatar: string, members: User[]): Promise<boolean> {
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

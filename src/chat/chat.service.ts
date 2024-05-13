import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.enity';
import { Group } from '../entities/chat.entity';
import { IChatService } from './interfaces/chat.interface.service';

@Injectable()
export class ChatService implements IChatService {
  create(id: bigint, name: string, avatar: string, members: User[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  get(id: bigint): Promise<Group> {
    throw new Error('Method not implemented.');
  }
  update(id: bigint, name: string, avatar: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: bigint): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getChatList(userID: bigint): Promise<Group[]> {
    throw new Error('Method not implemented.');
  }
  getUserInGroup(groupID: bigint): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

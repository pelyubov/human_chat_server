import { Injectable } from '@nestjs/common';
<<<<<<< HEAD:src/channel/channel.service.ts
import { Channel } from '../entities/channel.entity';
import { IChannelService } from './channel.interface.service';
import { User } from '@Project.Root/entities/user.entity';
=======
import { User } from 'src/user/entities/user.enity';
import { Group } from '../entities/chat.entity';
import { IChatService } from './interfaces/chat.interface.service';
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/chat/chat.service.ts

@Injectable()
export class ChannelService implements IChannelService {
  create(id: bigint, name: string, avatar: string, members: User[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
<<<<<<< HEAD:src/channel/channel.service.ts
  get(id: bigint): Promise<Channel> {
=======
  get(id: bigint): Promise<Group> {
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/chat/chat.service.ts
    throw new Error('Method not implemented.');
  }
  update(id: bigint, name: string, avatar: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: bigint): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
<<<<<<< HEAD:src/channel/channel.service.ts
  getChannelList(userID: bigint): Promise<Channel[]> {
=======
  getChatList(userID: bigint): Promise<Group[]> {
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/chat/chat.service.ts
    throw new Error('Method not implemented.');
  }
  getUserInChannel(channelID: bigint): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

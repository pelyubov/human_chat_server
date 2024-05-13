import { Injectable } from '@nestjs/common';
import { Channel } from '../entities/channel.entity';
import { IChannelService } from './channel.interface.service';
import { User } from '@Project.Root/entities/user.entity';

@Injectable()
export class ChannelService implements IChannelService {
  create(id: bigint, name: string, avatar: string, members: User[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  get(id: bigint): Promise<Channel> {
    throw new Error('Method not implemented.');
  }
  update(id: bigint, name: string, avatar: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: bigint): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getChannelList(userID: bigint): Promise<Channel[]> {
    throw new Error('Method not implemented.');
  }
  getUserInChannel(channelID: bigint): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

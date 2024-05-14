import { User } from '@Project.Root/entities/user.entity';
import { Channel } from '../entities/channel.entity';
import { ChannelId, UserId } from '@Project.Root/utils/types';

export interface IChannelService {
  create(id: ChannelId, name: string, avatar: string, members: User[]): Promise<boolean>;
  get(id: ChannelId): Promise<Channel>;
  update(id: ChannelId, name: string, avatar: string): Promise<boolean>;
  delete(id: ChannelId): Promise<boolean>;
  getChannelList(userID: UserId): Promise<Channel[]>;
  getUserInChannel(channelID: ChannelId): Promise<User[]>;
}

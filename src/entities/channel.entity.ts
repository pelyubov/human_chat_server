import { ChannelId, UserId } from '@Project.Utils/types';

export class Channel {
  constructor(
    public readonly id: ChannelId,
    public ownerId: UserId,
    public name: string,
    public members: bigint[],
    public photo?: string
  ) {}
}

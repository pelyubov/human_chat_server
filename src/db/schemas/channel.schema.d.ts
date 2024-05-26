import { ChannelId } from '@Project.Utils/types';

/** table */
export interface IChanMeta {
  chan_id: ChannelId;
  name: string;
}

export interface IChan extends IChanMeta {
  users: bigint[];
}

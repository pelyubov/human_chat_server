import { MessageId, UserId, Nullable, ChannelId } from '@Project.Utils/types';

export interface IMessageMeta {
  message_id: MessageId;
  author_id: UserId;
  channel_id: ChannelId;
  reply_to: Nullable<MessageId>;
  content: string;
  last_edit: Nullable<number>;
  created: number;
}

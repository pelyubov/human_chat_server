import { MessageId, UserId, Nullable, ChannelId } from '@Project.Utils/types';

export interface IMessage {
  id: MessageId;
  author: UserId;
  reply_to: Nullable<MessageId>;
  channel: ChannelId;
  content: string;
  last_edit: Nullable<number>;
}

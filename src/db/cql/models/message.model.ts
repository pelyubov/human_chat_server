import { Nullable } from '@Project.Utils/common';
import { ChannelId, MessageId, UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';

const messageModel: DataStaxMapping.ModelOptions = {
  columns: {
    id: 'message_id',
    author: 'author_id',
    channel: 'channel_id',
    replyTo: 'reply_to'
  },
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export default messageModel;

export interface MessageModel {
  id: MessageId;
  author: UserId;
  replyTo: Nullable<MessageId>;
  channel: ChannelId;
  content: string;
  lastEdit: Date;
}

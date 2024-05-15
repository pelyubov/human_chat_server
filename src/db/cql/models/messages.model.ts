import { Nullable } from '@Project.Utils/types';
import Snowflake from '@Project.Utils/snowflake';
import { ChannelId, MessageId, UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  columns: {
    id: 'message_id',
    author: 'author_id',
    channel: 'channel_id',
    replyTo: 'reply_to',
    timestamp: {
      name: 'message_id',
      toModel(columnValue) {
        return new Date(Snowflake.timestamp(columnValue));
      }
    }
  },
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export interface MessageModel {
  id: MessageId;
  author: UserId;
  replyTo: Nullable<MessageId>;
  channel: ChannelId;
  content: string;
  lastEdit: Date;
}

import { IMessageMeta } from '@Project.Database/schemas/message.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<IMessageMeta> = {
  table_name: 'messages',
  fields: {
    message_id: 'bigint',
    reply_to: 'bigint',
    content: 'text',
    last_edit: 'timestamp',
    author_id: 'bigint',
    channel_id: 'bigint'
  },
  key: ['message_id']
};

export default model;

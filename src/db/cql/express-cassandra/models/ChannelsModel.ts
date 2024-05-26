import type { IChanMeta } from '@Project.Database/schemas/channel.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<IChanMeta> = {
  table_name: 'channels',
  fields: {
    chan_id: 'bigint',
    name: 'text'
  },
  key: ['chan_id']
};

export default model;

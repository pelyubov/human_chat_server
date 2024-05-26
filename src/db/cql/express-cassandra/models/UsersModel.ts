import type { IUserMeta } from '@Project.Database/schemas/user.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<IUserMeta> = {
  table_name: 'users',
  fields: {
    user_id: 'bigint',
    email: 'text',
    credentials: 'text',
    display_name: 'text',
    username: 'text',
    bio: 'text'
  },
  key: ['user_id']
};

export default model;

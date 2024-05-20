import { IUser } from '@Project.Database/schemas/user.schema';
import { SchemaDefinition } from '../schema';
import { Long } from '@Project.Utils/types';

const model: SchemaDefinition<IUser> = {
  table_name: 'hc_users',
  fields: {
    user_id: 'bigint',
    email: 'text',
    credentials: 'text',
    display_name: 'text',
    username: 'text',
    bio: 'text'
  },
  key: [['user_id'], 'email', 'username']
};

export default model;

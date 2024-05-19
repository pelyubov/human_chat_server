import { UsersModel } from '@Project.Database/cql/schemas/users.schema';
import { SchemaDefinition, Long } from '../schema';

const model: SchemaDefinition<UsersModel> = {
  table_name: 'users',
  fields: {
    user_id: 'bigint',
    email: 'text',
    credentials: 'text',
    display_name: 'text',
    username: 'text',
    bio: 'text'
  },
  key: [['user_id'], 'email', 'username'],
  before_save(instance: Record<string, any>) {
    instance.user_id = Long.fromString(instance.user_id.toString());
    return true;
  }
};

export default model;

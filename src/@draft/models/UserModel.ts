import { SchemaDefinition } from '../../db/cql/express-cassandra/express-cassandra.helpers';
import { UserModel } from '@Project.Database/cql/schemas/user.schema';

const model: SchemaDefinition<UserModel> = {
  table_name: 'users',
  fields: {
    user_id: 'bigint',
    username: 'text',
    display_name: { type: 'text', default: 'no display name provided' },
    bio: 'text'
    // created_at: {
    //   type: 'date', // time
    //   get: () => new Date(Snowflake.timestamp(this!.user_id))
    // }
  },
  key: ['user_id']
};

export default model;
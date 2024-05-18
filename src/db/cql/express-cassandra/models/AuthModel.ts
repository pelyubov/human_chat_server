import { SchemaDefinition } from '../express-cassandra.helpers';
import { AuthModel } from '@Project.Database/cql/schemas/auth.schema';
import { types as DataStaxTypes } from 'cassandra-driver';

const model: SchemaDefinition<AuthModel> = {
  table_name: 'auth',
  fields: {
    user_id: 'bigint',
    email: 'text',
    credentials: 'text'
  },
  key: [['user_id'], 'email'],
  before_save(instance: Record<string, any>) {
    instance.user_id = DataStaxTypes.Long.fromString(instance.user_id.toString());
    return true;
  }
};

export default model;

import { TestModel } from '@Project.Database/cql/schemas/test.schema';
import { SchemaDefinition } from '../express-cassandra.helpers';

const model: SchemaDefinition<TestModel> = {
  table_name: 'test',
  fields: {
    ok: 'boolean',
    last_write: 'bigint'
  },
  key: ['ok']
};

export default model;

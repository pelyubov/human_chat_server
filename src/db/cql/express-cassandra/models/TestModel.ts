import { TestModel } from '@Project.Database/cql/schemas/test.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<TestModel> = {
  table_name: 'test',
  fields: {
    ok: 'boolean',
    last_write: 'bigint'
  },
  key: ['ok']
};

export default model;

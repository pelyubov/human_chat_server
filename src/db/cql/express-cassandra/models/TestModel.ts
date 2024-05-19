import { ITest } from '@Project.Database/cql/schemas/test.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<ITest> = {
  table_name: 'test',
  fields: {
    ok: 'boolean',
    last_write: 'bigint'
  },
  key: ['ok']
};

export default model;

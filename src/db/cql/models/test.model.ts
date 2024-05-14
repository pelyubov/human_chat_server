import { mapping as DataStaxMapping } from 'cassandra-driver';

const testModel: DataStaxMapping.ModelOptions = {
  columns: {
    ok: 'boolean'
  },
  keyspace: 'human_chat',
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export default testModel;

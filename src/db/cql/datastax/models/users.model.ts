import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

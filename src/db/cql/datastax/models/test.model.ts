import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  // column         model.property
  // hello_world -> helloWorld
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

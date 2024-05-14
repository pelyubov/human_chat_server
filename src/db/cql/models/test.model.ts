import { mapping as DataStaxMapping } from 'cassandra-driver';

const testModel: DataStaxMapping.ModelOptions = {
  // column         model.property
  // hello_world -> helloWorld
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export default testModel;

export interface TestModel {
  ok: boolean;
}

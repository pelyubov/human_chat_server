import { UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';

const authModel: DataStaxMapping.ModelOptions = {
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export default authModel;

export interface AuthModel {
  userId: UserId;
  email: string;
  credentials: string;
}

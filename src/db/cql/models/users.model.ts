import { UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';

const userModel: DataStaxMapping.ModelOptions = {
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export default userModel;

export interface UserModel {
  userId: UserId;
  username: string;
  displayName: string;
  bio: string;
}

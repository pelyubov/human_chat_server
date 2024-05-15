import { UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export interface UserModel {
  userId: UserId;
  username: string;
  displayName: string;
  bio: string;
}

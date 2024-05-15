import { UserId } from '@Project.Utils/types';
import { mapping as DataStaxMapping } from 'cassandra-driver';
import { z } from 'zod';

export const mapping: DataStaxMapping.ModelOptions = {
  tables: ['auth'],
  columns: {
    id: 'user_id'
  },
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

export interface AuthModel {
  id: UserId;
  email: string;
  credentials: string;
}

export const validator: z.ZodType<AuthModel> = z.object({
  id: z.bigint(),
  email: z.string().email('Invalid email'),
  credentials: z.string().min(1, 'Password hash is required')
});

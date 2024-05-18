import { UserId } from '@Project.Utils/types';
import { z } from 'zod';

export interface AuthModel {
  user_id: UserId;
  email: string;
  credentials: string;
}

export const validator: z.ZodType<AuthModel> = z.object({
  user_id: z.bigint(),
  email: z.string().email('Invalid email'),
  credentials: z.string().min(1, 'Password hash is required')
});

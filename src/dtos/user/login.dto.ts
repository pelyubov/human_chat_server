import { z } from 'zod';
import { passwordValidator } from '../validators';

export const LoginDto = z
  .object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string'
      })
      .email('Invalid email')
      .trim(),
    password: passwordValidator
  })
  .required();

export type ILoginDto = z.infer<typeof LoginDto>;

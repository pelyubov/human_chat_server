import { z } from 'zod';

export const LoginDto = z
  .object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string'
      })
      .email('Invalid email')
      .trim(),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string'
      })
      .min(1, 'Password is required')
      .trim()
  })
  .required();

export type ILoginDto = z.infer<typeof LoginDto>;

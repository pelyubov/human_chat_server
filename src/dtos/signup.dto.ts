import { z } from 'zod';

export const SignUpDto = z
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
      .trim(),
    username: z
      .string({
        required_error: 'Username is required',
        invalid_type_error: 'Username must be a string'
      })
      .refine(
        (value) => /^[a-z][a-z0-9._]+$/.test(value),
        'Username can only contain lowercase letters, numbers, periods, and underscores. It must start with a letter.'
      )
      .refine((value) => value.length > 4, 'Username must be at least 5 characters long.')
      .refine((value) => value.length < 33, 'Username must be at most 32 characters long.'),
    displayName: z.string().optional().nullable().default('')
  })
  .required();

export type ISignUpDto = z.infer<typeof SignUpDto>;

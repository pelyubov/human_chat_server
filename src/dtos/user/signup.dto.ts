import { z } from 'zod';
import { emailValidator, passwordValidator, usernameValidator } from '../validators';

export const SignUpDto = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    username: usernameValidator,
    displayName: z.string().optional()
  })
  .required();

export type ISignUpDto = z.infer<typeof SignUpDto>;

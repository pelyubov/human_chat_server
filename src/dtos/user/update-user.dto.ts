import { z } from 'zod';
import {
  displayNameValidator,
  emailValidator,
  passwordValidator,
  usernameValidator
} from '../validators';

export const UpdateUserDto = z.object({
  email: emailValidator.optional(),
  password: passwordValidator.optional(),
  oldPassword: z.string().optional(),
  username: usernameValidator.optional(),
  displayName: displayNameValidator.optional(),
  bio: z.string().optional()
});

export type IUpdateUserDto = z.infer<typeof UpdateUserDto>;

import { z } from 'zod';

export const channelNameValidator = z
  .string()
  .trim()
  .min(3, 'Channel name must be at least 3 characters long.')
  .max(32, 'Channel name cannot be longer than 32 characters.');

export const usernameValidator = z
  .string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string'
  })
  .min(5, 'Username must be at least 5 characters long.')
  .max(32, 'Username must be at most 32 characters long.')
  .refine(
    (value) => /^[a-z][a-z0-9._]+$/.test(value),
    'Username can only contain lowercase letters, numbers, periods, and underscores. It must start with a letter.'
  );

export const emailValidator = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  })
  .email('Invalid email')
  .trim();

export const passwordValidator = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  })
  .min(8, 'Password must be at least 8 characters long.');

export const displayNameValidator = z
  .string()
  .max(32, 'Display name cannot be longer than 32 characters.')
  .optional();

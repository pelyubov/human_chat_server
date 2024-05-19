import { ZodError } from 'zod';

/**
 * Throws an error indicating that a function is not implemented.
 */
export function todo(message?: string): never {
  const error = new Error(`TODO: ${message}`);
  error.name = 'NotImplementedError';
  Error.captureStackTrace(error);
  const stack = error.stack!.split('\n');
  stack.splice(1, 1);
  error.stack = stack.join('\n');
  throw error;
}

/**
 * Grab an environment variable.
 * If the variable is not set, an error is thrown unless a default value is provided.
 */
export function getenv(name: string, defaultValue = ''): string {
  if (!name) {
    throw new Error('Missing environment variable name');
  }
  const value = process.env[name];
  if (!value) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function formatError(e: ZodError) {
  return Object.fromEntries(e.errors.map((v) => [v.path.join('.'), v.message]));
}

import { ZodError } from 'zod';
import { Long } from './types';

/**
 * Throws an error indicating that a function is not implemented.
 * @param message - The message to include in the error.
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
 * @param name - The name of the environment variable.
 * @param defaultValue - The default value to use if the environment variable is not set.
 * @returns The value of the environment variable.
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

/**
 * Format a Zod error into a more readable format.
 * @param e - The Zod error.
 * @returns The formatted error.
 */
export function formatError(e: ZodError) {
  return Object.fromEntries(e.errors.map((v) => [v.path.join('.'), v.message]));
}

/**
 * Scramble strings together.
 * @param strings - The strings to scramble.
 * @returns The scrambled string.
 */
export function scrambleStrings(...strings: string[]) {
  let result = '';
  const chr = [''].concat(...strings.map((s) => s.split('')));
  for (let _ = 0; _ < chr.length; _++) {
    result += chr.splice(Math.floor(Math.random() * chr.length), 1);
  }
  return result;
}

export function base64Number(number: Long) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  let result = '';
  let n = Long.fromILong(number);
  while (n.gt(0)) {
    const mod = n.mod(64);
    result = alphabet.charAt(mod.toNumber()) + result;
    n = n.div(64);
  }
  return result;
}

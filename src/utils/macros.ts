export function todo(message?: string): never {
  const error = new Error(`TODO: ${message}`);
  error.name = 'NotImplementedError';
  Error.captureStackTrace(error);
  const stack = error.stack?.split('\n');
  stack.splice(1, 1);
  error.stack = stack.join('\n');
  throw error;
}

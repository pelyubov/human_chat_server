export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Fn = (...args: any[]) => any;

export type EmptyFn = () => void;
export function todo(message?: string): never {
  const error = new Error(message);
  error.name = 'NotImplementedError';
  Error.captureStackTrace(error);
  const stack = error.stack?.split('\n');
  stack.splice(1, 1);
  error.stack = stack.join('\n');
  throw error;
}

export function Todo(message?: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      todo!([target.name, message].filter(Boolean).join(': '));
      return original.apply(this, args);
    };
  };
}

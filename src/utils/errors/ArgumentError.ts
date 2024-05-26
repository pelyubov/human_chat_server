import { BaseError } from './BaseError';

export class ArgumentError extends BaseError {
  constructor(argName: string) {
    super(`Invalid argument: ${argName}`);
  }
}

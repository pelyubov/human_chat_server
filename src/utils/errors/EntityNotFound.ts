import { BaseError } from './BaseError';

export class EntityNotFound extends BaseError {
  constructor(entity: string) {
    super(`${entity} not found`);
  }
}

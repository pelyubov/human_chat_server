import { Nullable, SnowflakeId } from '@Project.Utils/types';
import { ConsoleLogger } from '@nestjs/common';

export interface CacheEntity<T> {
  id: SnowflakeId;
  timestamp: number;
  data: T;
}

interface CacheDbInitOptions {
  ttl?: number;
  capacity?: number;
  logHeader?: string;
  entityName?: string;
}

export class CacheDbContext<T> {
  private readonly logHeader: string;
  private readonly entityName?: string;
  private readonly ttl: number;
  protected readonly storage: Map<SnowflakeId, CacheEntity<T>> = new Map();
  capacity: number;

  get cache() {
    return this;
  }

  constructor(
    private readonly _logger: ConsoleLogger,
    private readonly options?: CacheDbInitOptions
  ) {
    const logHeaderName = this.options?.logHeader;
    this.logHeader = logHeaderName ? `${logHeaderName}.Cache` : 'CacheDbContext';
    this.entityName = this.options?.entityName ?? 'Unknown';
    this.ttl = this.options?.ttl || 60000;
    this.capacity = this.options?.capacity || 1000;
    this._logger.log(
      `Initialized CacheDbContext { ttl = ${this.ttl}, capacity = ${this.capacity} }`,
      this.logHeader
    );
  }

  set(id: SnowflakeId, data: T) {
    this.storage.set(id, { id, timestamp: Date.now(), data });
    this._logger.log(`Cache set ${this.entityName}(${id})`, this.logHeader);
  }

  get(id: SnowflakeId): Nullable<T> {
    const entity = this.storage.get(id);
    if (!entity) {
      this._logger.log(`Cache miss ${this.entityName}(${id})`, this.logHeader);
      return null;
    }
    if (Date.now() - entity.timestamp > this.ttl) {
      this.storage.delete(id);
      this._logger.log(`Cache expired ${this.entityName}(${id})`, this.logHeader);
      return null;
    }
    this._logger.log(`Cache hit ${this.entityName}(${id})`, this.logHeader);
    entity.timestamp = Date.now();
    this._logger.log(`Cache renewed ${this.entityName}(${id})`, this.logHeader);
    return entity.data;
  }

  invalidate(id: SnowflakeId) {
    this.storage.delete(id);
    this._logger.log(`Cache invalidated ${this.entityName}(${id})`, this.logHeader);
  }

  clear() {
    this.storage.clear();
    this._logger.log(`Cache cleared`, this.logHeader);
  }
}

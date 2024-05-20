import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import { Cache } from 'cache-manager';

@Injectable()
export class ChannelManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly logger: ConsoleLogger,
    private readonly gremlin: GremlinDbContext
  ) {
    this.logger.log('ChannelManagerService initialized', 'ChannelManagerService');
  }
}

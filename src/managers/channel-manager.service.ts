import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import { ChannelId } from '@Project.Utils/types';
import { IChanMeta } from '@Project.Database/schemas/channel.schema';

@Injectable()
export class ChannelManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly logger: ConsoleLogger,
    private readonly gremlin: GremlinDbContext
  ) {
    this.logger.log('ChannelManagerService initialized', 'ChannelManagerService');
  }

  fetch(channelId: ChannelId) /*: IChanMeta */ {

  }

  get(channelId: ChannelId) /*: IChanMeta */ {

  }
}

import { CqlDbContext } from '@Project.Database/cql.db.service';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import { LimitOps } from '@Project.Database/cql/express-cassandra/query';
import { IMessage } from '@Project.Database/schemas/message.schema';
import { Long } from '@Project.Utils/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MessageManager {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cqlDb: CqlDbContext,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('MessageManager initialized', 'MessageManager');
  }

  get cql() {
    return this.cqlDb.model('Messages') as ModelInstance<IMessage>;
  }

  async getMessagesByChannel(channelId: Long, count: number) {
    return await this.cql.findAsync({
      channel: channelId,
      $limit: count,
      $orderby: {
        $desc: ['id']
      }
    });
  }
}

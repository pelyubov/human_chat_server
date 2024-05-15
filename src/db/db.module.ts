import { ConsoleLogger, FactoryProvider, Global, Module } from '@nestjs/common';

import { ConfigService } from '@Project.Services/config.service';
import { DataStaxConnection } from './cql/datastax.db';
import { GremlinConnection } from './graph/gremlin.db';
import { CqlDbContext } from './cql.db.service';
import { GremlinDbContext } from './gremlin.db.service';

const cqlDbProvider: FactoryProvider<CqlDbContext> = {
  useFactory(logger: ConsoleLogger, config: ConfigService) {
    const connection = new DataStaxConnection(logger, config);
    return new CqlDbContext(connection, logger);
  },
  inject: [ConsoleLogger, ConfigService],
  provide: CqlDbContext
};

const gremlinDbProvider: FactoryProvider<GremlinDbContext> = {
  useFactory(logger: ConsoleLogger, config: ConfigService) {
    const connection = new GremlinConnection(logger, config);
    return new GremlinDbContext(connection, logger);
  },
  inject: [ConsoleLogger, ConfigService],
  provide: GremlinDbContext
};

@Global()
@Module({
  imports: [],
  providers: [cqlDbProvider, gremlinDbProvider],
  controllers: [],
  exports: [CqlDbContext, GremlinDbContext]
})
export class DbModule {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('DbModule initialized', 'DbModule');
  }
}

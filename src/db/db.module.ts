import { ConsoleLogger, FactoryProvider, Global, Module } from '@nestjs/common';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ConfigService } from '@Project.Services/config.service';
// import { DataStaxConnection } from './cql/datastax/connection';
import { ExpressCassandraConnection } from './cql/express-cassandra/connection';
import { GremlinConnection } from './graph/gremlin.db';
import { CqlDbContext } from './cql.db.service';
import { GremlinDbContext } from './gremlin.db.service';

const cqlDbProvider: FactoryProvider<CqlDbContext> = {
  useFactory(logger: ConsoleLogger, config: ConfigService) {
    const connection =
      // new DataStaxConnection(logger, config);
      new ExpressCassandraConnection(logger, config);
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
  imports: [CommonServicesModule],
  providers: [cqlDbProvider, gremlinDbProvider],
  controllers: [],
  exports: [CqlDbContext, GremlinDbContext]
})
export class DbModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('DbModule initialized', 'DbModule');
  }
}

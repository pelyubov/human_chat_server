import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { DataStaxConnection } from './cql/datastax.db';
import { Jsonable } from '@Project.Utils/common';

@Injectable()
export class CqlDbContext implements Jsonable {
  constructor(
    private readonly connection: DataStaxConnection,
    private readonly logger: ConsoleLogger,
    private readonly config: ConfigService
  ) {
    this.logger.log('CqlDbContext initialized', 'CqlDbContext');
  }
  toJSON() {
    return {
      connection: this.connection.toJSON()
    };
  }
}

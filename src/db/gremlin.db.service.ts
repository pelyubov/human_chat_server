import { ConsoleLogger, Injectable } from '@nestjs/common';
import { GremlinConnection } from './graph/gremlin.db';
import { ConfigService } from '@Project.Services/config.service';
import { Jsonable } from '@Project.Utils/common';

@Injectable()
export class GremlinDbContext implements Jsonable {
  constructor(
    private readonly connection: GremlinConnection,
    private readonly logger: ConsoleLogger,
    private readonly config: ConfigService
  ) {
    this.logger.log('GremlinDbContext initialized', 'GremlinDbContext');
  }
  toJSON() {
    return {
      connection: this.connection.toJSON()
    };
  }
}

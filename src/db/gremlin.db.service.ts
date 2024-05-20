import { ConsoleLogger, Injectable } from '@nestjs/common';
import { GremlinConnection } from './graph/gremlin.db';
import { Jsonable } from '@Project.Utils/types';

@Injectable()
export class GremlinDbContext implements Jsonable {
  constructor(
    private readonly connection: GremlinConnection,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('GremlinDbContext initialized', 'GremlinDbContext');
  }
  async restartConnection(force = false) {
    await this.connection.reconnect(force);
  }
  get g() {
    return this.connection.g;
  }
  toJSON() {
    return {
      connection: this.connection.toJSON()
    };
  }
}

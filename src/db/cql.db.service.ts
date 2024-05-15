import { ConsoleLogger, Injectable } from '@nestjs/common';
import { DataStaxConnection } from './cql/datastax.db';
import { Jsonable } from '@Project.Utils/common';

@Injectable()
export class CqlDbContext implements Jsonable {
  constructor(
    private readonly connection: DataStaxConnection,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('CqlDbContext initialized', 'CqlDbContext');
  }
  async restartConnection(force = false) {
    await this.connection.reconnect(force);
  }
  toJSON() {
    return {
      connection: this.connection.toJSON()
    };
  }
}

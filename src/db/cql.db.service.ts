import { Client as DataStaxClient } from 'cassandra-driver';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { TableName } from '@Project.Database/schemas';
import { Jsonable } from '@Project.Utils/types';
import { CqlDbConnectionImpl } from './cql/cql.db.iface';

@Injectable()
export class CqlDbContext implements Jsonable {
  constructor(
    readonly connection: CqlDbConnectionImpl<DataStaxClient>,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('CqlDbContext initialized', 'CqlDbContext');
  }
  async restartConnection(force = false) {
    await this.connection.reconnect(force);
  }
  model<T extends TableName>(name: T) {
    return this.connection.model(name);
  }
  async toJSON() {
    return {
      connection: await this.connection.toJSON()
    };
  }
}

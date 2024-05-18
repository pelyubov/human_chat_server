import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Jsonable } from '@Project.Utils/types';
import { TableName } from './cql/schemas/schema';
import { CqlDbConnectionImpl } from './cql/cql.db.iface';
import { DataStaxConnection } from './cql/datastax/datastax.db';
import { ExpressCassandraConnection } from './cql/express-cassandra/express-cassandra.db';

@Injectable()
export class CqlDbContext implements Jsonable {
  constructor(
    // public readonly connection: DataStaxConnection,
    public readonly connection: ExpressCassandraConnection,
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

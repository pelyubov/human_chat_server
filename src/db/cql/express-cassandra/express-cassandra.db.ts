import * as ExpressCassandra from 'express-cassandra';
import {
  ClientOptions as CassandraDriverOptions,
  types as CassandraDriverTypes
} from 'cassandra-driver';
import { ConsoleLogger } from '@nestjs/common';
import { Jsonable, VoidFn } from '@Project.Utils/types';
import { AssertionError } from 'assert';
import { ConfigService } from '@Project.Services/config.service';
import { CqlDbConnectionImpl } from '../cql.db.iface';
import { Schema, TableName } from '../schemas/schema';
import { ModelInstance } from './express-cassandra.helpers';
import { Client as DataStaxClient } from 'cassandra-driver';

export class ExpressCassandraConnection
  extends CqlDbConnectionImpl<ExpressCassandra>
  implements Jsonable
{
  static instance: ExpressCassandraConnection;
  private expressCassandra: ExpressCassandra;
  private listeners: VoidFn<[Error]>[] = [];

  public get client() {
    return this.expressCassandra.driver;
  }

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly config: ConfigService
  ) {
    super();
    if (ExpressCassandraConnection.instance) {
      return ExpressCassandraConnection.instance;
    }
    this.init();
    ExpressCassandraConnection.instance = this;
  }

  async init() {
    await this.connect();
  }

  async connect() {
    try {
      const { contactPoints, keyspace, localDataCenter, port } = this.config.cassandraConfig;
      ExpressCassandra.setDirectory(__dirname + '/models');
      await ExpressCassandra.bindAsync({
        clientOptions: {
          contactPoints,
          keyspace,
          localDataCenter,
          queryOptions: { prepare: true },
          protocolOptions: {
            port,
            maxVersion: CassandraDriverTypes.protocolVersion.maxSupported
          }
        } as CassandraDriverOptions,
        ormOptions: {
          createKeyspace: false
          // createTable: true
        }
      });

      await this.test(ExpressCassandra);
      this.expressCassandra = ExpressCassandra;
      this.logger.log('Initialization completed successfully.', 'ExpressCassandra');
    } catch (e) {
      this.logger.error(`An error ocurred while setting up ExpressCassandra`, 'ExpressCassandra');
      this.logger.error(e, 'ExpressCassandra');
      this.logger.error('Initialization failed.', 'ExpressCassandra');
    }
  }

  async test(client: ExpressCassandra) {
    this.logger.log('Testing query (findOne from Test) ASSERT (ok = True)', 'ExpressCassandra');
    const test = await client.instance.Test.findOneAsync({ ok: true });
    const testResult = `Testing ${test.ok ? 'passed' : 'failed'}: Got \`${JSON.stringify(test.ok)}\``;
    if (!test.ok) throw new AssertionError({ message: testResult });
    this.logger.log(testResult, 'ExpressCassandra');
  }

  async close() {
    return await this.expressCassandra.closeAsync();
  }

  async reconnect(force = false) {
    if (!force) {
    }
    await this.close();
    await this.connect();
  }

  registerListener(listener: VoidFn<[Error]>) {
    this.listeners.push(listener);
  }

  model<ModelName extends TableName>(name: ModelName) {
    return this.expressCassandra.instance[name] as ModelInstance<Schema<ModelName>>;
  }

  async toJSON() {
    const client = (await this.model('Test').get_cql_clientAsync()) as DataStaxClient & {
      connected: boolean;
    };
    const clientState = client.getState();
    return {
      type: 'ExpressCassandra',
      connected: client.connected,
      hosts: clientState.getConnectedHosts().reduce((connections, host) => {
        connections[host.datacenter] ??= {};
        connections[host.datacenter][host.address] = {
          status: host.isUp() ? 'UP' : 'DOWN',
          rack: host.rack,
          openConnections: clientState.getOpenConnections(host)
        };
        return connections;
      }, {}),
      driver: {
        type: 'DataStax.Driver',
        version: this.client.version
      }
    };
  }
}

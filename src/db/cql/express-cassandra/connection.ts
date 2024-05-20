import { AssertionError } from 'assert';
import * as ExpressCassandra from 'express-cassandra';
import {
  ClientOptions as CassandraDriverOptions,
  types as CassandraDriverTypes
} from 'cassandra-driver';
import { ConsoleLogger } from '@nestjs/common';
import { Schema, TableName } from '@Project.Database/schemas';
import { ConfigService } from '@Project.Services/config.service';
import { Jsonable, VoidFn } from '@Project.Utils/types';
import { ModelInstance } from './helpers';
import { CqlDbConnectionImpl } from '../cql.db.iface';

export class ExpressCassandraConnection
  extends CqlDbConnectionImpl<ExpressCassandra>
  implements Jsonable
{
  static instance: ExpressCassandraConnection;
  private expressCassandra: ExpressCassandra;
  private listeners: VoidFn<[Error]>[] = [];

  get client() {
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
    try {
      await this.connect();
    } catch (e) {
      this.logger.error(`An error ocurred while setting up ExpressCassandra`, 'ExpressCassandra');
      this.logger.error(e, 'ExpressCassandra');
      this.logger.error('Initialization failed.', 'ExpressCassandra');
    }
  }

  async connect() {
    const { contactPoints, keyspace, localDataCenter, port } = this.config.cassandraConfig;
    ExpressCassandra.setDirectory(__dirname + '/models');
    this.logger.log('Initializing ExpressCassandra', 'ExpressCassandra');
    this.logger.log(`contactPoints: ${contactPoints}`, 'ExpressCassandra.Parameters');
    this.logger.log(`keyspace: ${keyspace}`, 'ExpressCassandra.Parameters');
    this.logger.log(`localDataCenter: ${localDataCenter}`, 'ExpressCassandra.Parameters');
    this.logger.log(`port: ${port}`, 'ExpressCassandra.Parameters');
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
    this.logger.log('Reconnection procedure initiated.', 'ExpressCassandra');
    await this.close();
    this.logger.log('Shutdown complete. Starting client...', 'ExpressCassandra');
    await this.connect();
    this.logger.log('Reconnection procedure completed successfully.', 'ExpressCassandra');
  }

  registerListener(listener: VoidFn<[Error]>) {
    this.listeners.push(listener);
  }

  model<ModelName extends TableName>(name: ModelName) {
    return this.expressCassandra.instance[name] as ModelInstance<Schema<ModelName>>;
  }

  async toJSON() {
    const client = await this.model('Test').get_cql_clientAsync();
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

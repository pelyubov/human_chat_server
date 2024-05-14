import { resolve } from 'path';
import { AssertionError } from 'assert';
import { lstat, readdir } from 'fs/promises';
import type { ConsoleLogger } from '@nestjs/common';
import {
  Client as DataStaxClient,
  types as DriverTypes,
  mapping as DataStaxMapping
} from 'cassandra-driver';

import type { ConfigService } from '@Project.Services/config.service';
import { Jsonable, VoidFn } from '@Project.Utils/common';
import { CqlDbConnectionImpl } from './cql.db.iface';
import { Schema, TableName } from './models/schema';

export class DataStaxConnection extends CqlDbConnectionImpl<DataStaxClient> implements Jsonable {
  private static instance: DataStaxConnection;
  private _client: DataStaxClient;
  private _mapper: DataStaxMapping.Mapper;
  private _initMappings: Record<string, DataStaxMapping.ModelOptions> = {};
  private assertClient() {
    if (!this._client) {
      throw new Error('DataStaxDriver is not initialized');
    }
  }
  public get client() {
    this.assertClient();
    return this._client;
  }
  public get mapper() {
    this.assertClient();
    return this._mapper;
  }
  constructor(
    private logger: ConsoleLogger,
    private config: ConfigService
  ) {
    super();
    if (DataStaxConnection.instance) {
      return DataStaxConnection.instance;
    }
    this.init();
  }

  async init() {
    const { contactPoints, keyspace, localDataCenter, port } = this.config.cassandraConfig;
    this.logger.log('Initializing DataStaxDriver', 'DataStax.Driver');
    this.logger.log(`contactPoints: ${contactPoints}`, 'DataStax.Driver.Parameters');
    this.logger.log(`keyspace: ${keyspace}`, 'DataStax.Driver.Parameters');
    this.logger.log(`localDataCenter: ${localDataCenter}`, 'DataStax.Driver.Parameters');
    this.logger.log(`port: ${port}`, 'DataStax.Driver.Parameters');
    const client = new DataStaxClient({
      contactPoints,
      localDataCenter,
      keyspace,
      protocolOptions: {
        port,
        maxVersion: DriverTypes.protocolVersion.maxSupported
      }
    });

    try {
      await client.connect();
      await this.test(client);
      this._client = client;
      DataStaxConnection.instance = this;
      this.logger.log('DataStaxDriver initialization completed successfully.', 'DataStax.Driver');
      await this.registerModelFolder(resolve(__dirname, 'models'));
      await this.establishMappings();
    } catch (e) {
      this.logger.error(`An error ocurred while setting up DataStaxDriver`, 'DataStax.Driver');
      this.logger.error(e, 'DataStax.Driver');
      this.logger.error('DataStaxDriver initialization failed.', 'DataStax.Driver');
    }
  }

  protected async test(client: DataStaxClient) {
    this.logger.log(
      'Testing query (SELECT silly FROM sayuri.Test WHERE sayiyu = 1310) ASSERT (silly = True)',
      'DataStax.Driver'
    );
    const {
      rows: [{ silly }]
    } = await client.execute('SELECT silly FROM sayuri.Test WHERE sayiyu = 1310');
    const resultString = `Testing ${silly ? 'passed' : 'failed'}: Got \`${silly}\``;
    if (!silly) throw new AssertionError({ message: resultString });
    this.logger.log(resultString, 'DataStax.Driver');
  }

  public async registerModelFolder(path: string) {
    for (const file of await readdir(path)) {
      if (!file.match(/\.model\.js$/)) continue;
      const modelName = file.split('.').slice(0, -2)[0];
      try {
        if (!/^[A-Za-z_]+$/.test(modelName)) throw new Error(`Invalid model name: ${modelName}`);
        const fullPath = resolve(__dirname, 'models', file);
        if ((await lstat(fullPath)).isDirectory()) await this.registerModelFolder(fullPath);
        const path = resolve(__dirname, 'models', file);
        const model = (await import(path).then((m) => m.default)) as DataStaxMapping.ModelOptions;
        if (Object.keys(model).length === 0) throw new Error('Empty model');
        this.logger.log(`Registering Model(${modelName})`, 'DataStax.Mappings');
        this._initMappings[modelName] = model;
      } catch (e) {
        this.logger.error(`Resgiter failed for Model(${modelName}): ${e}`, 'DataStax.Mappings');
      }
    }
  }

  public async establishMappings() {
    this.assertClient();
    try {
      this.logger.log('Establishing mappings...', 'DataStax.Mappings');
      const mapper =  new DataStaxMapping.Mapper(this._client, {
        models: this._initMappings
      });
      this._mapper = mapper;
      const count = Object.entries(this._initMappings).length;
      this.logger.log(
        count
          ? `Mappings established for ${count} mapping${count > 1 ? 's' : ''}.`
          : 'No mappings were established.',
        'DataStax.Mappings'
      );
      await this.testMappings();
    } catch (e) {
      this.logger.error('Failed to establish mappings', 'DataStax.Mappings');
      this.logger.error(e, 'DataStax.Mappings');
    }
  }

  private async testMappings() {
    this.assertClient();
    this.logger.log('Testing mappings...', 'DataStax.Mappings');
    this.logger.log('Testing: Model(Test) find { ok = True }', 'DataStax.Mappings');
    const result = await this.model('test').get({ ok: true });
    const resultString = `Testing ${result.ok ? 'passed' : 'failed'}: Got \`${result.ok}\``;
    if (!result.ok) throw new AssertionError({ message: resultString });
    this.logger.log(resultString, 'DataStax.Mappings');
  }

  public addEventListener(event: string, listener: VoidFn) {
    this._client.on(event, listener);
  }

  public removeEventListener(event: string, listener: VoidFn) {
    this._client.removeListener(event, listener);
  }

  public model<ModelName extends TableName>(name: ModelName) {
    this.assertClient();
    return this._mapper.forModel<Schema<ModelName>>(name);
  }

  close() {
    this._client.shutdown();
    this._client = null;
  }

  toJSON() {
    const clientState = this._client.getState();
    return {
      type: 'DataStax.Driver',
      hosts: clientState.getConnectedHosts().reduce((connections, host) => {
        connections[host.datacenter] ??= {};
        connections[host.datacenter][host.address] = {
          status: host.isUp() ? 'UP' : 'DOWN',
          openConnections: clientState.getOpenConnections(host)
        };
        return connections;
      }, {}),
      mappings: this._initMappings
    };
  }
}

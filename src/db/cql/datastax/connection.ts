import { resolve } from 'path';
import { AssertionError } from 'assert';
import { lstat, readdir } from 'fs/promises';
import type { ConsoleLogger } from '@nestjs/common';
import {
  Client as DataStaxClient,
  types as DriverTypes,
  mapping as DataStaxMapping
} from 'cassandra-driver';

import { Schema, TableName } from '@Project.Database/schemas';
import type { ConfigService } from '@Project.Services/config.service';
import { Jsonable, VoidFn } from '@Project.Utils/types';
import { CqlDbConnectionImpl } from '../cql.db.iface';
import { TableModel } from './helpers';

export class DataStaxConnection extends CqlDbConnectionImpl<DataStaxClient> implements Jsonable {
  private static instance: DataStaxConnection;
  private _client?: DataStaxClient;
  private _mapper?: DataStaxMapping.Mapper;
  private _mappingDefs = new Map<string, DataStaxMapping.ModelOptions>();
  private assertClient() {
    if (!this._client) {
      throw new Error('DataStaxDriver is not initialized');
    }
  }
  get client() {
    this.assertClient();
    return this._client!;
  }
  get mapper() {
    this.assertClient();
    return this._mapper!;
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
    DataStaxConnection.instance = this;
  }

  async init() {
    try {
      await this.connect();
      this.logger.log('DataStaxDriver initialization completed successfully.', 'DataStax.Driver');
      await this.loadMappings();
    } catch (e) {
      this.logger.error(`An error ocurred while setting up DataStaxDriver`, 'DataStax.Driver');
      this.logger.error(e, 'DataStax.Driver');
      this.logger.error('DataStaxDriver initialization failed.', 'DataStax.Driver');
    }
  }

  async connect() {
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
    this.logger.log(`Connecting...`, 'DataStax.Driver');
    await client.connect();
    const connectedHosts = client
      .getState()
      .getConnectedHosts()
      .map((h) => h.address);
    this.logger.log(`Connected to ${connectedHosts}`, 'DataStax.Driver');
    await this.test(client);
    this._client = client;
  }

  async reconnect(force = false) {
    if (!force && this.client.getState().getConnectedHosts().length > 0) {
      return;
    }
    try {
      this.logger.log('Reconnection procedure initiated.', 'DataStax.Driver');
      await this.client.shutdown();
      this.logger.log('Shutdown completed. Reconnecting...', 'DataStax.Driver');
      await this.connect();
      await this.test(this._client!);
      this.logger.log('Reconnection completed successfully.', 'DataStax.Driver');
    } catch (e) {
      this.logger.error('Reconnection procedure failed.', 'DataStax.Driver');
      this.logger.error(e, 'DataStax.Driver');
      throw e;
    }
  }

  async loadMappings() {
    await this.registerModelFolder(resolve(__dirname, 'models'));
    await this.establishMappings();
  }

  async close() {
    this.logger.log('Shutting down DataStaxDriver', 'DataStax.Driver');
    const client = this._client;
    await client?.shutdown();
    delete this._client;
    delete this._mapper;
    this._mappingDefs.clear();
    this.logger.log('DataStaxDriver shutdown completed.', 'DataStax.Driver');
  }

  protected async test(client: DataStaxClient) {
    // TODO: Move the test query to an environment variable or via model binding
    this.logger.log(
      'Testing query (SELECT silly FROM sayuri.Test WHERE sayiyu = 1310) ASSERT (silly = True)',
      'DataStax.Driver'
    );
    const {
      rows: [{ silly }]
    } = await client.execute('SELECT silly FROM sayuri.Test WHERE sayiyu = 1310');
    const resultString = `Testing ${silly ? 'passed' : 'failed'}: Got \`${silly}\``;
    if (!silly) {
      throw new AssertionError({ message: resultString });
    }
    this.logger.log(resultString, 'DataStax.Driver');
    this.logger.log('Read test completed successfully.', 'DataStax.Driver');
  }

  async registerModelFolder(path: string) {
    for (const file of await readdir(path)) {
      if (!file.match(/\.model\.js$/)) continue;
      const modelName = file.split('.').slice(0, -2)[0];
      try {
        if (!/^[A-Za-z_]+$/.test(modelName)) {
          throw new Error(`Invalid model name: ${modelName}`);
        }
        if (this._mappingDefs.has(modelName)) {
          throw new Error(`Model(${modelName}) is already registered`);
        }
        const fullPath = resolve(__dirname, 'models', file);
        if ((await lstat(fullPath)).isDirectory()) {
          await this.registerModelFolder(fullPath);
        }
        const path = resolve(__dirname, 'models', file);
        const { mapping } = (await import(path)) as {
          mapping: DataStaxMapping.ModelOptions;
        };
        if (!Object.keys(mapping).length) {
          throw new Error('Empty model');
        }
        this.logger.log(`Registering Model(${modelName})`, 'DataStax.Mappings');
        this._mappingDefs.set(modelName, mapping);
      } catch (e) {
        this.logger.error(`Resgiter failed for Model(${modelName}): ${e}`, 'DataStax.Mappings');
      }
    }
  }

  async establishMappings() {
    this.assertClient();
    try {
      this.logger.log('Establishing mappings...', 'DataStax.Mappings');
      const mapper = new DataStaxMapping.Mapper(this.client, {
        models: Object.fromEntries(this._mappingDefs.entries())
      });
      this._mapper = mapper;
      const count = this._mappingDefs.size;
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
    this.logger.log('Testing query: Model(Test) find { ok = True }', 'DataStax.Mappings');
    const model = this.model('Test').mapper;
    const readResult = await model.get({ ok: true });
    const resultString = `Reading ${readResult?.ok ? 'passed' : 'failed'}: Got \`${readResult?.ok}\``;
    if (!readResult?.ok) {
      throw new AssertionError({ message: resultString });
    }
    this.logger.log(resultString, 'DataStax.Mappings');
    const now = Date.now();
    this.logger.log(
      `Testing write: Model(Test) find { ok = True } insert { lastWrite = ${now} }`,
      'DataStax.Mappings'
    );
    await model.update({ ok: true, last_write: now });
    this.logger.log('Write test passed.', 'DataStax.Mappings');
    this.logger.log('Mapping tests passed.', 'DataStax.Mappings');
  }

  addEventListener(event: string, listener: VoidFn) {
    this.client.on(event, listener);
  }

  removeEventListener(event: string, listener: VoidFn) {
    this.client.removeListener(event, listener);
  }

  model<ModelName extends TableName>(name: ModelName) {
    this.assertClient();
    return new TableModel<Schema<ModelName>>(
      this.mapper.forModel<Schema<ModelName>>(name.toLowerCase())
    );
  }

  async toJSON() {
    if (!this._client)
      return {
        type: 'DataStax.Driver',
        status: 'DOWN (Client is not initialized)'
      };

    const clientState = this._client.getState();
    return {
      type: 'DataStax.Driver',
      status: 'UP',
      hosts: clientState.getConnectedHosts().reduce((connections, host) => {
        connections[host.datacenter] ??= {};
        connections[host.datacenter][host.address] = {
          status: host.isUp() ? 'UP' : 'DOWN',
          openConnections: clientState.getOpenConnections(host)
        };
        return connections;
      }, {}),
      mappings: this._mappingDefs
    };
  }
}

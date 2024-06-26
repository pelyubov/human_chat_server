import { ConfigService } from '@Project.Services/config.service';
import { Jsonable } from '@Project.Utils/types';
import { ConsoleLogger } from '@nestjs/common';
import { AssertionError } from 'assert';
import { driver } from 'gremlin';
import { AnonymousTraversalSource, GraphSON3ReaderEx } from './helpers';
import { GraphTraversalSource } from './types';

export class GremlinConnection implements Jsonable {
  static instance: GremlinConnection;
  private _client?: driver.DriverRemoteConnection;
  private _g?: GraphTraversalSource;
  private assertClient() {
    if (!this._client) {
      throw new Error('GremlinDriver is not initialized');
    }
  }
  constructor(
    private logger: ConsoleLogger,
    private config: ConfigService
  ) {
    if (GremlinConnection.instance) {
      return GremlinConnection.instance;
    }

    this.init();
    GremlinConnection.instance = this;
  }

  get client() {
    this.assertClient();
    return this._client!;
  }

  get g() {
    this.assertClient();
    return this._g!;
  }

  async init() {
    await this.connect();
  }

  async connect() {
    const { host, port, endpoint } = this.config.gremlinConfig;
    try {
      this.logger.log('Initializing GremlinDriver', 'Gremlin.Driver');
      this.logger.log(`host: ${host}`, 'Gremlin.Driver.Parameters');
      this.logger.log(`port: ${port}`, 'Gremlin.Driver.Parameters');
      this.logger.log(`endpoint: ${endpoint}`, 'Gremlin.Driver.Parameters');
      const url = `ws://${host}:${port}${endpoint}`;
      this.logger.log(`url: ${url}`, 'Gremlin.Driver.Parameters');

      const remoteConnection = new driver.DriverRemoteConnection(url, {
        reader: new GraphSON3ReaderEx()
      });

      this.logger.log(`Connecting...`, 'Gremlin.Driver');
      await remoteConnection.open();
      const g = AnonymousTraversalSource.traversal().withRemote(
        remoteConnection
      ) as GraphTraversalSource;
      await this.test(g);
      this._client = remoteConnection;
      this._g = g;
      this.logger.log('GremlinDriver initialization completed successfully.', 'Gremlin.Driver');
    } catch (e) {
      this.logger.error('GremlinDriver initialization failed.', 'Gremlin.Driver');
      this.logger.error(e, 'Gremlin.Driver');
    }
  }

  async close() {
    this.logger.log('Shutting down GremlinDriver', 'Gremlin.Driver');
    delete this._g;
    await this._client?.close();
    this.logger.log('GremlinDriver shutdown completed', 'Gremlin.Driver');
  }

  async reconnect(force = false) {
    if (!force && this._client?.isOpen) {
      return;
    }
    this.logger.log('Reconnection procedure initiated.', 'Gremlin.Driver');
    await this.close();
    this.logger.log('Reconnecting...', 'Gremlin.Driver');
    await this.connect();
    this.logger.log('Reconnection procedure completed successfully.', 'Gremlin.Driver');
  }

  private async test(g: GraphTraversalSource) {
    this.logger.log(
      'Testing query (g.V() hasLabel("test") property(ok)) ASSERT (value = True)',
      'Gremlin.Driver'
    );
    const result = await g.V().hasLabel('test').next();
    const {
      properties: {
        ok: [{ value }]
      }
    } = result.value;

    const resultString = `Testing ${value ? 'passed' : 'failed'}: Got \`${value}\``;
    if (!value) {
      throw new AssertionError({ message: resultString });
    }
    this.logger.log(resultString, 'Gremlin.Driver');
  }

  toJSON() {
    if (!this._client) return 'GremlinDriver is not initialized';

    const { isOpen, isSessionBound } = this._client;
    return {
      type: 'Gremlin.Driver',
      isOpen,
      isSessionBound
    };
  }
}

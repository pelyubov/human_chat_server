import { ConfigService } from '@Project.Services/config.service';
import { Jsonable } from '@Project.Utils/types';
import { ConsoleLogger } from '@nestjs/common';
import { AssertionError } from 'assert';
import { driver, process as gremlinProcess } from 'gremlin';

export type GraphTraversalSource =
  gremlinProcess.GraphTraversalSource<gremlinProcess.GraphTraversal>;
const traversal = gremlinProcess.AnonymousTraversalSource.traversal;

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
    this.init().catch();
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
    try {
      await this.connect();
      GremlinConnection.instance = this;
      this.logger.log('GremlinDriver initialization completed successfully.', 'Gremlin.Driver');
    } catch (e) {
      this.logger.error('GremlinDriver initialization failed.', 'Gremlin.Driver');
      this.logger.error(e, 'Gremlin.Driver');
    }
  }

  async connect() {
    const { host, port, endpoint } = this.config.gremlinConfig;

    this.logger.log('Initializing GremlinDriver', 'Gremlin.Driver');
    this.logger.log(`host: ${host}`, 'Gremlin.Driver.Parameters');
    this.logger.log(`port: ${port}`, 'Gremlin.Driver.Parameters');
    this.logger.log(`endpoint: ${endpoint}`, 'Gremlin.Driver.Parameters');
    const url = `ws://${host}:${port}${endpoint}`;
    this.logger.log(`url: ${url}`, 'Gremlin.Driver.Parameters');

    const client = new driver.DriverRemoteConnection(url);
    this.logger.log(`Connecting...`, 'Gremlin.Driver');
    await client.open();
    const g = traversal().withRemote(client);
    await this.test(g);
    this._client = client;
    this._g = g;
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
    await this.close();
    await this.connect();
  }

  private async test(g: GraphTraversalSource) {
    this.logger.log(
      'Testing query (g.V() hasLabel("test") property(ok)) ASSERT (value = True)',
      'Gremlin.Driver'
    );
    const {
      properties: {
        ok: [{ value }]
      }
    } = (await g.V().hasLabel('test').next()).value;
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
      type: 'GremlinDriver',
      isOpen,
      isSessionBound
    };
  }
}

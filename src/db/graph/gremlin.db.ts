import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger } from '@nestjs/common';
import { AssertionError } from 'assert';
import { driver, process as gremlinProcess } from 'gremlin';

export type GraphTraversalSource =
  gremlinProcess.GraphTraversalSource<gremlinProcess.GraphTraversal>;
const traversal = gremlinProcess.AnonymousTraversalSource.traversal;

export class GremlinConnection {
  static instance: GremlinConnection;
  private _client: driver.DriverRemoteConnection;
  private _g: GraphTraversalSource;

  constructor(
    private logger: ConsoleLogger,
    private config: ConfigService
  ) {
    if (GremlinConnection.instance) {
      return GremlinConnection.instance;
    }
    this.init();
  }

  get g() {
    return this._g;
  }

  async init() {
    const { host, port, endpoint } = this.config.gremlinConfig;

    this.logger.log('Initializing GremlinDriver', 'Gremlin.Driver');
    this.logger.log(`host: ${host}`, 'Gremlin.Driver.Parameters');
    this.logger.log(`port: ${port}`, 'Gremlin.Driver.Parameters');
    this.logger.log(`endpoint: ${endpoint}`, 'Gremlin.Driver.Parameters');
    const url = `ws://${host}:${port}${endpoint}`;
    this.logger.log(`url: ${url}`, 'Gremlin.Driver.Parameters');
    this.logger.log(`Connecting...`, 'Gremlin.Driver');

    const client = new driver.DriverRemoteConnection(url);

    try {
      await client.open();
      const g = traversal().withRemote(client);
      await this.test(g);
      this._client = client;
      this._g = g;
      GremlinConnection.instance = this;
      this.logger.log('GremlinDriver initialization completed successfully.', 'Gremlin.Driver');
    } catch (error) {
      this.logger.error('GremlinDriver initialization failed.', 'Gremlin.Driver');
      this.logger.error(error, 'Gremlin.Driver');
    }
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

  close() {
    this._g = null;
    this._client.close();
  }
}

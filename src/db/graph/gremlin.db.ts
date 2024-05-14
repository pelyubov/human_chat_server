import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger } from '@nestjs/common';
import { config } from 'dotenv';
import { driver, process as gremlinProcess } from 'gremlin';
config();

export type GraphTraversalSource =
  gremlinProcess.GraphTraversalSource<gremlinProcess.GraphTraversal>;
const traversal = gremlinProcess.AnonymousTraversalSource.traversal;
type DriverRemoteConnectionType = driver.DriverRemoteConnection;
const DriverRemoteConnection = driver.DriverRemoteConnection;

export class GremlinConnection {
  static instance: GremlinConnection;
  private _client: DriverRemoteConnectionType;
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

  private async init() {
    const { janusgraphAddress, janusgraphPort } = this.config.gremlinConfig;

    this.logger.log(`Connecting to JanusGraph at ${janusgraphAddress}:${janusgraphPort}`);

    const client = new DriverRemoteConnection(
      `ws://${janusgraphAddress}:${janusgraphPort}/gremlin`
    );
    try {
      await client.open();
      const g = traversal().withRemote(client);
      this.test(g);
      this._client = client;
      this._g = g;
      GremlinConnection.instance = this;
      return GremlinConnection.instance;
    } catch (error) {
      this.logger.error(`Failed to connect to JanusGraph: ${error}`);
    }
  }

  private async test(g: GraphTraversalSource) {
    // add log
    g.V().toList();
  }

  close() {
    this._g = null;
    this._client.close();
  }
}

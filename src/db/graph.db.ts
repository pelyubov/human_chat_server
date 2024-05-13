import { config } from 'dotenv';
import { driver, process as gremlinProcess } from 'gremlin';
import IDbContext from './db.abstract';
config();

export type GraphTraversalSource =
  gremlinProcess.GraphTraversalSource<gremlinProcess.GraphTraversal>;
const traversal = gremlinProcess.AnonymousTraversalSource.traversal;
type DriverRemoteConnectionType = driver.DriverRemoteConnection;
const DriverRemoteConnection = driver.DriverRemoteConnection;

const {
  ADDRESS1: host,
  JANUSGRAPH_PORT: port,
  JANUSGRAPH_GREMLIN_ENDPOINT: wsEndpoint,
  JANUSGRAPH_GRAPH_NAME: graphName,
} = process.env;

const endpoint = `ws://${host}:${port}/${wsEndpoint}`;

export default class GraphDBContext extends IDbContext {
  private static _instance: GraphDBContext;
  protected client: DriverRemoteConnectionType;
  protected g: GraphTraversalSource;
  protected graphName: string;
  private endpoint: string;

  constructor(graphName?: string, endpoint?: string) {
    if (GraphDBContext._instance) {
      return GraphDBContext._instance;
    }
    super();
    this.endpoint = endpoint;
    this.graphName = graphName;
    this.client = new DriverRemoteConnection(this.endpoint, {});
    this.connect();
    GraphDBContext._instance = this;
  }

  static get instance(): GraphDBContext {
    if (!this._instance) {
      throw new Error('GraphDBContext is not initialized');
    }
    return this._instance;
  }

  get graph(): GraphTraversalSource {
    return this.g;
  }

  async test() {
    const result = await this.g.V().toList();
    for (const r of Object.entries(result[0])) {
      console.log(r);
    }
    this.disconnect();
  }

  protected async connect(): Promise<void> {
    const g = traversal().withRemote(this.client);
    this.g = g;
  }

  protected async disconnect(): Promise<void> {
    this.g = null;
    this.client.close();
  }
}

new GraphDBContext(graphName, endpoint);
// GraphDBContext.instance.test();

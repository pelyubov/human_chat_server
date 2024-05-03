import gremlin from 'gremlin';
import IDbContext from './db.abstract';

export type GraphTraversalSource =
  gremlin.process.GraphTraversalSource<gremlin.process.GraphTraversal>;
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;

const {
  JANUSGRAPH_HOST: HOST,
  JANUSGRAPH_PORT: PORT,
  JANUSGRAPH_GREMLIN_ENDPOINT: WS_ENDPOINT,
  JANUSGRAPH_GRAPH_NAME: GRAPH_NAME,
} = process.env;

const endpoint = `${HOST}:${PORT}/${WS_ENDPOINT}`;

export default class GraphDBContext extends IDbContext {
  private static _instance: GraphDBContext;
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
    this.connect();
    GraphDBContext._instance = this;
  }

  static get instance(): GraphDBContext {
    if (!this.instance) {
      throw new Error('GraphDBContext is not initialized');
    }
    return this.instance;
  }

  get graph(): GraphTraversalSource {
    return this.g;
  }

  protected async connect(): Promise<void> {
    const g = traversal().withRemote(new DriverRemoteConnection(this.endpoint));
    this.g = g;
  }
  protected async disconnect(): Promise<void> {
    this.g = null;
  }
}

new GraphDBContext(GRAPH_NAME, endpoint);

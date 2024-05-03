import gremlin from 'gremlin';
import IDbContext from './db.abstract';

type GraphTraversalSource = gremlin.process.GraphTraversalSource<gremlin.process.GraphTraversal>;
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
  private static instance: GraphDBContext;
  protected g: GraphTraversalSource;
  protected graphName: string;
  private endpoint: string;

  constructor(graphName?: string, endpoint?: string) {
    if (GraphDBContext.instance) {
      return GraphDBContext.instance;
    }
    super();
    this.endpoint = endpoint;
    this.graphName = graphName;
    this.connect();
    GraphDBContext.instance = this;
  }

  protected async connect(): Promise<void> {
    const g = traversal().withRemote(new DriverRemoteConnection(this.endpoint));
    this.g = g;
  }
}

new GraphDBContext(GRAPH_NAME, endpoint);

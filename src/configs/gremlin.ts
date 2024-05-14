import { GremlinConfig } from '@Project.Utils/types';
import { env } from 'process';

export default (): GremlinConfig => ({
  host: env.JANUSGRAPH_HOST,
  port: parseInt(env.JANUSGRAPH_PORT, 10),
  endpoint: env.JANUSGRAPH_ENDPOINT
});

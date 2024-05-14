import { GremlinConfig } from '@Project.Utils/types';
import { env } from 'process';

export default (): GremlinConfig => ({
  janusgraphAddress: env.JANUSGRAPH_ADDRESS,
  janusgraphPort: parseInt(env.JANUSGRAPH_PORT, 10)
});

import { getenv } from '@Project.Utils/helpers';
import { GremlinConfig } from '@Project.Utils/types';

export default (): GremlinConfig => ({
  host: getenv('JANUSGRAPH_HOST'),
  port: parseInt(getenv('JANUSGRAPH_PORT'), 10),
  endpoint: getenv('JANUSGRAPH_ENDPOINT')
});

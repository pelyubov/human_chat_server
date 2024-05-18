import Snowflake from '@Project.Utils/snowflake';
import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  columns: {
    message_id: 'id',
    timestamp: {
      name: 'message_id',
      toModel(columnValue) {
        return new Date(Snowflake.timestamp(columnValue));
      }
    }
  },
  mappings: new DataStaxMapping.UnderscoreCqlToCamelCaseMappings()
};

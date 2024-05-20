import { getenv } from '@Project.Utils/helpers';
import { CassandraConfig } from '@Project.Database/cql/types';

export default (): CassandraConfig => ({
  contactPoints: getenv('CASSANDRA_HOSTS').split(','),
  localDataCenter: getenv('CASSANDRA_DATACENTER'),
  keyspace: getenv('CASSANDRA_KEYSPACE'),
  port: parseInt(getenv('CASSANDRA_PORT', '9042'), 10)
});

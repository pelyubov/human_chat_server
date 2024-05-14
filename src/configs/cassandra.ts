import { CassandraConfig } from '@Project.Utils/types';
import { env } from 'process';

export default (): CassandraConfig => ({
  contactPoints: env.CASSANDRA_HOSTS.split(','),
  localDataCenter: env.CASSANDRA_DATACENTER,
  keyspace: env.CASSANDRA_KEYSPACE,
  port: parseInt(env.CASSANDRA_PORT, 10)
});

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      /** Cassandra contact points, separated by a coma `,`. */
      CASSANDRA_HOSTS: string;
      /** Cassandra local datacenter to use. */
      CASSANDRA_DATACENTER: string;
      /** Cassandra port to connect to. */
      CASSANDRA_PORT: string;
      /** Cassandra keyspace to use. */
      CASSANDRA_KEYSPACE: string;
      /** Machine's id. Used for Snowflake ID generation. */
      MACHINE_ID: string;

      /** JanusGraph address to connect to. */
      JANUSGRAPH_ADDRESS: string;
      /** JanusGraph port to connect to. */
      JANUSGRAPH_PORT: string;
    }
  }
}

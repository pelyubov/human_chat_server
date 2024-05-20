export interface CassandraConfig {
  contactPoints: string[];
  localDataCenter: string;
  keyspace: string;
  port: number;
}

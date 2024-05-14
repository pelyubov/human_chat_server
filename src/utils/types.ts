export type MessageId = bigint;
export type UserId = bigint;
export type ChannelId = bigint;

export interface CassandraConfig {
  contactPoints: string[];
  localDataCenter: string;
  keyspace: string;
  port: number;
}

export interface GremlinConfig {
  host: string;
  port: number;
  endpoint: string;
}

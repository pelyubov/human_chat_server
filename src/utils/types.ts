import { types as DataStaxTypes } from 'cassandra-driver';

export const Long = DataStaxTypes.Long;
export const TimeUuid = DataStaxTypes.TimeUuid;
export const Uuid = DataStaxTypes.Uuid;
export const Tuple = DataStaxTypes.Tuple;
export const InetAddress = DataStaxTypes.InetAddress;
export const BigDecimal = DataStaxTypes.BigDecimal;
export const Duration = DataStaxTypes.Duration;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Fn<A extends any[] = [], R = void> = (...args: A) => R;
export type VoidFn<A extends any[] = []> = Fn<A>;
export type AnyFn = Fn<any[], any>;
export type Constructor<T = any> = new (...args: any[]) => T;
export type InstanceFields<T> = {
  [K in keyof T]: T[K] extends AnyFn ? never : K;
};

export type RequiredProps<T> = {
  [K in keyof T]-?: T[K];
};

export type StringKeys<T> = Extract<keyof T, string>;

export type EmptyFn = () => void;

export interface Jsonable {
  toJSON(): any;
}

export type SnowflakeId = InstanceType<typeof Long>;
export type MessageId = SnowflakeId;
export type UserId = SnowflakeId;
export type ChannelId = SnowflakeId;

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

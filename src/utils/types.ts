export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Fn<A extends any[] = [], R = void> = (...args: A) => R;
export type VoidFn<A extends any[] = []> = Fn<A>;
export type AnyFn = Fn<any[], any>;
export type Constructor<T = any> = new (...args: any[]) => T;
export type InstanceFields<T> = {
  [K in keyof T]: T[K] extends AnyFn ? never : K;
};

export type OptionalProps<T> = {
  [K in keyof T]?: T[K];
};
export type RequiredProps<T> = {
  [K in keyof T]-?: T[K];
};

export type EmptyFn = () => void;

export interface Jsonable {
  toJSON(): any;
}

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

import { Fn } from '@Project.Utils/types';
import { types as DataStaxTypes } from 'cassandra-driver';
import { InsertQueryOptions } from './query';

export type DataTypes = keyof typeof DataStaxTypes.dataTypes;

type DefaultFieldDefinition = {
  type: DataTypes;
  default?: string | { $db_function: string } | Fn<never, string>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CompositeKeyQuery<T extends string, U extends string = T> = T extends T
  ? `${T}` | `${T},${CompositeKeyQuery<Exclude<U, T>>}`
  : never;

export type SchemaDefinition<
  T,
  PrimaryKeys extends Array<keyof T> = Array<keyof T>,
  ClusteringKeys extends keyof T = keyof T
> = {
  fields: {
    [K in keyof T]: DataTypes | DefaultFieldDefinition;
  };
  key: PrimaryKeys | (PrimaryKeys | ClusteringKeys)[];
  indexes?: (keyof T)[];
  table_name: string;
  clustering_order?: { [K in keyof T]?: 'asc' | 'desc' };
  before_save?: (instance: T, options: InsertQueryOptions) => boolean;
};

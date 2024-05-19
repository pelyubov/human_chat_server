import { Fn } from '@Project.Utils/types';
import { types as DataStaxTypes } from 'cassandra-driver';
import { DeleteQueryOptions, InsertQueryOptions, QueryObject } from './query';

export type DataTypes = keyof typeof DataStaxTypes.dataTypes;

interface DataTypeDefinition {
  type: DataTypes;
}
interface ValidatorDefinition<T> {
  validator: (value: T) => boolean;
  message?: (value: T) => string;
}

interface RuleDefinition<T> {
  rule: {
    required?: boolean;
    validator?: (value: T) => boolean;
    validators?: ValidatorDefinition<T>[];
    ignore_default?: boolean;
  };
}

interface DefaultDefinition {
  default?: string | { $db_function: string } | Fn<never, string>;
}

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
    [K in keyof T]: DataTypes | (DataTypeDefinition & (DefaultDefinition | RuleDefinition<T[K]>));
  };
  key: PrimaryKeys | (PrimaryKeys | ClusteringKeys)[];
  indexes?: (keyof T)[];
  table_name: string;
  clustering_order?: { [K in keyof T]?: 'asc' | 'desc' };

  before_save?: (instance: T, options: InsertQueryOptions) => boolean;
  after_save?: (instance: T, options: InsertQueryOptions) => boolean;
  before_update?: (
    query: QueryObject<T>,
    updateValues: Partial<T>,
    options: InsertQueryOptions
  ) => boolean;
  after_update?: (
    query: QueryObject<T>,
    updateValues: Partial<T>,
    options: InsertQueryOptions
  ) => boolean;
  before_delete?: (query: QueryObject<T>, options: DeleteQueryOptions) => boolean;
  after_delete?: (query: QueryObject<T>, options: DeleteQueryOptions) => boolean;
};

export const Long = DataStaxTypes.Long;
export const TimeUuid = DataStaxTypes.TimeUuid;
export const Uuid = DataStaxTypes.Uuid;
export const Tuple = DataStaxTypes.Tuple;
export const InetAddress = DataStaxTypes.InetAddress;
export const BigDecimal = DataStaxTypes.BigDecimal;
export const Duration = DataStaxTypes.Duration;

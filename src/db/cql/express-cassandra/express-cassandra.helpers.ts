import { types as DataStaxTypes, Client as DataStaxClient } from 'cassandra-driver';
import { Fn, OptionalProps } from '@Project.Utils/types';

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

type ModelQueryResult<T> = T & ModelInstance<T>;
type SelectAliasStatement<T extends string> = T | `${T} ${'AS' | 'as'} ${string}`;

type StringKeys<T> = Extract<keyof T, string>;

export interface CommonQueryOptions {
  /** Prepare the query before executing it. */
  prepare?: boolean;
  /** Only generates CQL queries. */
  return_query?: boolean;
}

export interface SelectQueryOptions<T> extends CommonQueryOptions {
  /** Return result as raw objects. */
  raw?: boolean;
  /** Only take those defined columns.
   *
   *  **Note.** This returns the rows as raw objects.
   */
  select?: (StringKeys<T> | SelectAliasStatement<StringKeys<T>>)[];
  /** Adds a `DISTINCT` clause to the query. */
  distinct?: boolean;
  /** Allow filtering on non-primary key columns. */
  allow_filtering?: boolean;
}

export interface SelectStatement<T> extends SelectQueryOptions<T> {
  select: (StringKeys<T> | SelectAliasStatement<StringKeys<T>>)[];
}

interface MutateQueryOptions extends CommonQueryOptions {
  /** Time-to-live (how long this data should last) in seconds. */
  ttl?: number;
}

interface UpdateQueryOptions<T> extends MutateQueryOptions {
  /** Perform an `IF EXISTS` check before mutating. */
  if_exists?: boolean;
  /** Conditions to match. */
  conditions?: OptionalProps<T>;
}

interface InsertQueryOptions extends MutateQueryOptions {
  /** Perform an `IF NOT EXISTS` check before insertion. */
  if_not_exists?: boolean;
}

interface DeleteQueryOptions extends CommonQueryOptions {}

export interface QueryRaw {
  raw: true;
}

export interface QueryOnly {
  return_query: true;
}

type CqlQuery = {
  query: string;
  params: any[];
};

export enum CompareOps {
  EQ = '$eq',
  /** Only applicable for `IF` statements. */
  NE = '$ne',
  ISNT = '$isnt',
  LT = '$lt',
  LTE = '$lte',
  GT = '$gt',
  GTE = '$gte'
}

export enum QueryOps {
  IN = '$in',
  /** Only applicable for SASI indexes. */
  LIKE = '$like',
  /** Only applicable for token queries. */
  TOKEN = '$token',
  /** Only applicable for indexed collections. */
  CONTAINS = '$contains',
  /** Only applicable for indexed maps. */
  CONTAINS_KEY = '$contains_key',

  ORDER_BY = '$orderby',
  GROUP_BY = '$groupby',
  INDEX_EXPR = '$expr'
}

export enum LimitOps {
  LIMIT = '$limit',
  PER_PARTITION_LIMIT = '$per_partition_limit'
}

export enum OrderOps {
  ASC = '$asc',
  DESC = '$desc'
}

interface BuiltinQueryOps<T> {
  [QueryOps.ORDER_BY]?: { [Ord in OrderOps]?: StringKeys<T> | StringKeys<T>[] };
  [QueryOps.GROUP_BY]?: StringKeys<T>[];
  [QueryOps.INDEX_EXPR]?: {
    index: string;
    query: string;
  };
}

type TokenQuery<T> = {
  // [K2 in CompositeKeyQuery<StringKeys<T>>]?: {
  [K2: string]:
    | T[keyof T]
    | {
        [QueryOps.TOKEN]?: {
          [Op in CompareOps]?: T[keyof T] | Array<T[keyof T]>;
        };
      }
    | undefined;
};

type SingleQueryObject<T> = BuiltinQueryOps<T> &
  TokenQuery<T> & {
    [K in StringKeys<T>]?:
      | T[K]
      | { [QueryOps.IN]?: T[K][] }
      | { [QueryOps.LIKE]?: string }
      | { [Op in CompareOps]?: T[K] };
  };

type QueryObject<T> = SingleQueryObject<T> & {
  [Op in LimitOps]?: number;
};

export interface ModelInstance<T> {
  // We definitely know that this is a class,
  // and also don't want to deal with generated `abstract class` file either.
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (data: T): ModelInstance<T>;

  findAsync<QueryOptions extends SelectQueryOptions<T>>(
    query: QueryObject<T>,
    options?: QueryOptions
  ): Promise<
    QueryOptions extends QueryOnly
      ? CqlQuery
      : QueryOptions extends QueryRaw | SelectStatement<T>
        ? T[]
        : ModelQueryResult<T>[]
  >;

  findOneAsync<QueryOptions extends SelectQueryOptions<T>>(
    query: SingleQueryObject<T>,
    options?: QueryOptions
  ): Promise<
    QueryOptions extends QueryOnly
      ? CqlQuery
      : QueryOptions extends QueryRaw | SelectStatement<T>
        ? T
        : ModelQueryResult<T>
  >;

  updateAsync<QueryOptions extends UpdateQueryOptions<T>>(
    query: QueryObject<T>,
    updateValues: OptionalProps<T>,
    options?: QueryOptions
  ): Promise<QueryOptions extends QueryOnly ? CqlQuery : T>;

  deleteAsync<QueryOptions extends DeleteQueryOptions>(
    query: QueryObject<T>,
    options?: QueryOptions
  ): Promise<QueryOptions extends QueryOnly ? CqlQuery : T>;

  saveAsync<QueryOptions extends InsertQueryOptions>(
    options?: QueryOptions
  ): Promise<QueryOptions extends QueryOnly ? CqlQuery : T>;

  truncateAsync(): never;
  eachRowAsync(): never; // { autoPage: true, fetchSize: 1000, pageState: ...  }
  streamAsync(): never;
  searchAsync(): never;
  syncDBAsync(): never;
  get_cql_clientAsync(): Promise<DataStaxClient>;
}

// let a: ModelInstance<AuthModel>;
//
// a!.findAsync({ credentials: '2' }, {}).then((b) => {
//   b;
// });

import { StringKeys } from '@Project.Utils/types';

type SelectAliasStatement<T extends string> = T | `${T} ${'AS' | 'as'} ${string}`;
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

export interface MutateQueryOptions extends CommonQueryOptions {
  /** Time-to-live (how long this data should last) in seconds. */
  ttl?: number;
}

export interface UpdateQueryOptions<T> extends MutateQueryOptions {
  /** Perform an `IF EXISTS` check before mutating. */
  if_exists?: boolean;
  /** Conditions to match. */
  conditions?: Partial<T>;
}

export interface InsertQueryOptions extends MutateQueryOptions {
  /** Perform an `IF NOT EXISTS` check before insertion. */
  if_not_exists?: boolean;
}

export interface DeleteQueryOptions extends CommonQueryOptions {}

export interface QueryRaw {
  raw: true;
}

export interface QueryOnly {
  return_query: true;
}

export type CqlQuery = {
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

export interface BuiltinQueryOps<T> {
  [QueryOps.ORDER_BY]?: { [Ord in OrderOps]?: StringKeys<T> | StringKeys<T>[] };
  [QueryOps.GROUP_BY]?: StringKeys<T>[];
  [QueryOps.INDEX_EXPR]?: {
    index: string;
    query: string;
  };
}

export type TokenQuery<T> = {
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

export type SingleQueryObject<T> = BuiltinQueryOps<T> &
  TokenQuery<T> & {
    [K in StringKeys<T>]?:
      | T[K]
      | { [QueryOps.IN]?: T[K][] }
      | { [QueryOps.LIKE]?: string }
      | { [Op in CompareOps]?: T[K] };
  };

export type QueryObject<T> = SingleQueryObject<T> & {
  [Op in LimitOps]?: number;
};

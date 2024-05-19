import { Client as DataStaxClient } from 'cassandra-driver';
import {
  CqlQuery,
  DeleteQueryOptions,
  InsertQueryOptions,
  QueryObject,
  QueryOnly,
  QueryRaw,
  SelectQueryOptions,
  SelectStatement,
  SingleQueryObject,
  UpdateQueryOptions
} from './query';

type ModelQueryResult<T> = T & ModelInstance<T>;

export interface ExpressCassandraCqlClient extends DataStaxClient {
  connected: boolean;
}

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
    updateValues: Partial<T>,
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
  get_cql_clientAsync(): Promise<ExpressCassandraCqlClient>;
}

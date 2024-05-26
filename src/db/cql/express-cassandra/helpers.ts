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
import { Nullable } from '@Project.Utils/types';

export type ModelQueryResult<T> = T & ModelInstance<T>;

export interface ExpressCassandraCqlClient extends DataStaxClient {
  connected: boolean;
}

export interface ModelInstance<T> {
  // We definitely know that this is a class,
  // and also don't want to deal with generated `abstract class` file either.
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (data: T): ModelInstance<T>;

  /**
   * Check if a field has been modified.
   */
  isModified(fieldName: keyof T): boolean;

  /**
   * Finds model instances that satisfies the `query`.
   * @param query The query to find the model instance.
   * @param options Additional options for the query.
   *
   * **Note.** If you are not searching by primary key, remember to use `allow_filtering` in `options`.
   */
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

  /**
   * Finds the first model instance that satisfies the `query`.
   * @param query The query to find the model instance.
   * @param options Additional options for the query.
   *
   * **Note.** If you are not searching by primary key, remember to use `allow_filtering` in `options`.
   */
  findOneAsync<QueryOptions extends SelectQueryOptions<T>>(
    query: SingleQueryObject<T>,
    options?: QueryOptions
  ): Promise<
    QueryOptions extends QueryOnly
      ? CqlQuery
      : QueryOptions extends QueryRaw | SelectStatement<T>
        ? Nullable<T>
        : Nullable<ModelQueryResult<T>>
  >;

  /**
   * Finds the model instance that satisfies the `query`, then updates it with `updateValues`.
   * @param query The query to find the model instance.
   * @param updateValues The values to update the model instance with.
   * @param options Additional options for the query.
   *
   * **Note.** If you are not searching by primary key, remember to use `allow_filtering` in `options`.
   *
   * **Note.** You **cannot** modify values of primary / cluster keys.
   */
  updateAsync<QueryOptions extends UpdateQueryOptions<T>>(
    query: QueryObject<T>,
    updateValues: Partial<T>,
    options?: QueryOptions
  ): Promise<QueryOptions extends QueryOnly ? CqlQuery : T>;

  /**
   * Deletes the first model instance that satisfies the `query`.
   * @param query The query to find the model instance.
   * @param options Additional options for the query.
   *
   * **Note.** If you are not searching by primary key, remember to use `allow_filtering` in `options`.
   */
  deleteAsync<QueryOptions extends DeleteQueryOptions>(
    query: QueryObject<T>,
    options?: QueryOptions
  ): Promise<QueryOptions extends QueryOnly ? CqlQuery : T>;

  /**
   * Inserts a new model instance with the `values`.
   * @param values The values to insert into the model instance.
   * @param options Additional options for the query.
   */
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

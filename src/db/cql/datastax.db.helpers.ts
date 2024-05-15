import { FilterKeys } from '@Project.Utils/types';
import { todo } from '@Project.Utils/helpers';
import { mapping as DataStaxMapping } from 'cassandra-driver';
import { z } from 'zod';

type ExecOptions = string | DataStaxMapping.MappingExecutionOptions;

interface Limit {
  limit?: number;
}
interface TTL {
  ttl?: number;
}
interface Order<T> {
  orderBy?: { [K in FilterKeys<T, string>]: 'asc' | 'desc' | string };
}
interface Fields<T> {
  fields?: Array<FilterKeys<T, string>>;
}

/** @overrides `DataStaxMapping.GetDocInfo` */
interface GetQueryOptions<T> extends Fields<T> {}
/** @overrides `DataStaxMapping.FindDocInfo` */
interface FindQueryOptions<T> extends Fields<T>, Order<T>, Limit {}
/** @overrides `DataStaxMapping.InsertDocInfo` */
interface InsertQueryOptions<T> extends Fields<T>, TTL {
  ifNotExists?: boolean;
}
/** @overrides `DataStaxMapping.UpdateDocInfo` */
interface UpdateQueryOptions<T> extends Fields<T>, Order<T>, Limit, TTL {
  ifExists?: boolean;
  deleteOnlyColumns?: boolean;
  when?: { [K in FilterKeys<T, string>]: T[K] };
}
interface RemoveQueryOptions<T> extends Fields<T>, Limit, TTL {
  ifExists?: boolean;
  deleteOnlyColumns?: boolean;
  when?: { [K in FilterKeys<T, string>]: T[K] };
}

export class TableModel<T extends { [key: string]: any }> {
  constructor(
    public readonly mapper: DataStaxMapping.ModelMapper<T>,
    public readonly validator: z.ZodType<T>
  ) {}

  get(query: Partial<T>, options?: GetQueryOptions<T>, execOptions?: ExecOptions) {
    return this.mapper.get(query, options, execOptions);
  }

  findOne(query: Partial<T>, options: FindQueryOptions<T>, execOptions?: ExecOptions) {
    return this.mapper.find(query, options, execOptions);
  }

  findAll(query: Partial<T>, execOptions?: ExecOptions) {
    return this.mapper.findAll(query, execOptions);
  }

  findAllAndUpdate(query: Partial<T>, update: Partial<T>, execOptions?: ExecOptions) {
    todo!('return this.mapper.batching.update()');
    // return this.mapper.batching.update()
  }

  insert(doc: T, options?: InsertQueryOptions<T>, execOptions?: ExecOptions) {
    return this.mapper.insert(doc, options, execOptions);
  }

  update(doc: Partial<T>, options?: UpdateQueryOptions<T>, execOptions?: ExecOptions) {
    return this.mapper.update(doc, options, execOptions);
  }

  remove(doc: Partial<T>, options?: RemoveQueryOptions<T>, execOptions?: ExecOptions) {
    return this.mapper.remove(doc, options, execOptions);
  }
}

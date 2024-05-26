import { process } from 'gremlin';

/* eslint-disable @typescript-eslint/no-misused-new */
export class TraverserImpl<T = any> extends process.Traverser {
  constructor(object: T, bulk?: number);
}

export type Traverser<T> = TraverserImpl<T> & T;

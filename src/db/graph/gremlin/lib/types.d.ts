// * This class was inferred from Apache 'gremlin' NodeJS library,
// * with types inferred from Apache TinkerPop API JavaDocs.
// * Mainly this is to define typings for the Gremlin API,
// * since the library has "too-generic" TypeScript definitions.
// ! Those definitions however, may not be accurate and should be used with caution.
// ! When encountering mismatched runtime types, consider filing an issue.

import type { process as GremlinProcess, struct as GremlinStruct } from 'gremlin';

export type Graph = GremlinStruct.Graph;
export type TraversalBase = GremlinProcess.Traversal;
export type TraversalStrategies = GremlinProcess.TraversalStrategies;
export type TraversalStrategies = GremlinProcess.TraversalStrategy;
export type Bytecode = GremlinProcess.Bytecode;

export type { Edge2 as Edge } from './edge';
export type { Vertex2 as Vertex, VertexProperty2 as VertexProperty } from './vertex';
export type { GraphTraversal as GraphTraversal } from './graph-traversal';
export type { GraphTraversalSource } from './graph-traversal-source';
export type { StaticSource } from './static-traversal-source';
export type { Traverser } from './traverser';
export type { Traversal } from './traversal';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
  SHUFFLE = 'shuffle'
}

export enum Token {
  ID = 'id',
  LABEL = 'label',
  KEY = 'key',
  VALUE = 'value'
}

export enum Merge {
  /** Allows for more complex definition of the IN vertex. */
  IN_V = 'inV',
  /** Allows definition of the action to take when a merge operation ends up not matching the search criteria. */
  ON_CREATE = 'onCreate',
  /** Allows definition of the action to take when a merge operation ends up successfully matching the search criteria. */
  ON_MATCH = 'onMatch',
  /** Allows for more complex definition of the OUT vertex. */
  OUT_V = 'outV'
}

export enum Pop {
  /** Get all the items and return them as a list. */
  ALL = 'all',
  /** The first item in an ordered collection. */
  FIRST = 'first',
  /** The last item in an ordered collection. */
  LAST = 'last',
  /** Get the items as either a list (for multiple) or an object (for singles). */
  MIXED = 'mixed'
}

export enum VertexCardinality {
  SINGLE = 'single',
  LIST = 'list',
  SET = 'set'
}

export enum Direction {
  BOTH = 'BOTH',
  IN = 'IN',
  OUT = 'OUT'
}

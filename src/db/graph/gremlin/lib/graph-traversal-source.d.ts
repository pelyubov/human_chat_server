// ! This definition may not be accurate and should be used with caution.
// ! When encountering mismatched runtime types, consider filing an issue.

/* eslint-disable prettier/prettier */
import type { Nullable, Long, Fn } from '@Project.Utils/types';
import type { driver, process } from 'gremlin';
import type { Traversal } from './traversal';
import type { Vertex2 as Vertex } from './vertex';
import type { Edge2 as Edge } from './edge';
import type { GraphTraversal as GraphTraversal } from './graph-traversal';
import type { TraversalStrategies } from './types';

export class GraphTraversalSource extends process.GraphTraversalSource<GraphTraversal> {
  constructor(
    graph: Nullable<Graph>,
    traversalStrategies: Nullable<TraversalStrategies>,
    bytecode?: Bytecode,
    graphTraversalSourceClass?: Newable<GraphTraversalSource>,
    graphTraversalClass?: Newable<T>
  ): GraphTraversalSource;
  withRemote(remoteConnection: driver.RemoteConnection): this;
  tx(): process.Transaction<this>;
  toString(): string;
  /**
   * Provides a configuration to a traversal in the form of a key which is the same as with(key, true).
   */
  with_(key: string): this;

  /**
   * Provides a configuration to a traversal in the form of a key and a value.
   */
  with_(key: string, value: object): this;

  /**
   * ! Documentation is missing
   */
  withBulk(useBulk: boolean): this;

  /**
   * ! Documentation is missing
   */
  withPath(): this;

  /**
   * Adds a sack to be used throughout the life of a spawned `Traversal`.
   */
  withSack<A>(sack: A): this;

  withSack<A>(initialValue: A): this;

  withSack<A>(initialValue: A, mergeOperator: Fn<[A, A], A>): this;

  withSack<A>(initialValue: A, splitOperator: Fn<[A], A>): this;

  withSack<A>(initialValue: A, splitOperator: Fn<[A], A>, mergeOperator: Fn<[A, A], A>): this;

  withSack<A>(supplier: Fn<[], A>): this;

  withSack<A>(supplier: Fn<[], A>, mergeOperator: Fn<[A, A], A>): this;

  withSack<A>(supplier: Fn<[], A>, splitOperator: Fn<[A], A>): this;

  withSack<A>(supplier: Fn<[], A>, splitOperator: Fn<[A], A>, mergeOperator: Fn<[A, A], A>): this;

  /**
   * 	Add a sideEffect to be used throughout the life of a spawned `Traversal`.
   */
  withSideEffect<A>(key: string, initialValue: A): this;

  withSideEffect<A>(key: string, initialValue: A, reducer: Fn<[A, A], A>): this;

  withSideEffect<A>(key: string, supplier: Fn<[], A>): this;

  withSideEffect<A>(key: string, supplier: Fn<[], A>, reducer: Fn<[A, A], A>): this;

  /**
   * Adds an arbitrary collection of TraversalStrategy instances to the traversal source.
   */
  withStrategies(strategies: TraversalStrategies): this;

  /**
   * Removes an arbitrary collection of TraversalStrategy instances to the traversal source.
   */
  withoutStrategies(strategies: TraversalStrategies): this;
  /**
   * Starts a `GraphTraversal` starting with all edges or some subset of edges as specified by their unique identifier.
   */
  E<OutEdge extends Edge = Edge>(...edgeIds: Long[]): GraphTraversal<OutEdge, OutEdge>;

  /**
   * Starts a `GraphTraversal` starting with all vertices or some subset of vertices as specified by their unique identifier.
   */
  V<OutVertex extends Vertex = Vertex>(...vertexIds: Long[]): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Starts a `GraphTraversal` by adding an edge with the specified label.
   */
  addE<OutEdge extends Edge = Edge>(label: string): GraphTraversal<OutEdge, OutEdge>;

  /**
   * Starts a `GraphTraversal` by doing a merge (i.e. upsert) style operation for an Edge using a Map as an argument.
   */
  mergeE<OutEdge extends Edge = Edge>(searchCreate: Record<?, ?>): GraphTraversal<OutEdge, OutEdge>;

  /**
   * Starts a `GraphTraversal` by doing a merge (i.e. upsert) style operation for an Edge using a traversal as an argument.
   */
  mergeE<OutEdge extends Edge = Edge>(searchCreate: Traversal<?, Record<?, ?>>): GraphTraversal<OutEdge, OutEdge>;

  /**
   * Starts a `GraphTraversal` by adding a vertex with the specified label.
   */
  addV<OutVertex extends Vertex = Vertex>(...args: any[]): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Starts a `GraphTraversal` by doing a merge (i.e. upsert) style operation for a Vertex using a Map as an argument.
   */
  mergeV<OutVertex extends Vertex = Vertex>(searchCreate: Record<?, ?>): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Starts a `GraphTraversal` by doing a merge (i.e. upsert) style operation for a Vertex using a traversal as an argument.
   */
  mergeV<OutVertex extends Vertex = Vertex>(searchCreate: Traversal<?, Record<?, ?>>): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Spawns a GraphTraversal starting it with arbitrary values.
   */
  inject<S>(...startValues: S[]): GraphTraversal<S, S>;

  /**
   * Performs a read or write based operation on the `Graph` backing this `GraphTraversalSource`.
   */
  io<S>(file: string): GraphTraversal<S, S>;
}

// ! This definition may not be accurate and should be used with caution.
// ! When encountering mismatched runtime types, consider filing an issue.

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Long, Nullable, Fn } from '@Project.Utils/types';
import { process as GremlinProcess, structure as GremlinStruct } from 'gremlin';
import { Traversal, Traverser } from './traversal';
import { Vertex2 as Vertex } from './vertex';
import { Edge2 as Edge } from './edge';
import { Predicate } from './predicate';
import { Direction } from './types';

type Graph = GremlinStruct.Graph;
type Bytecode = GremlinProcess.Bytecode;
type TraversalStrategies = GremlinProcess.TraversalStrategies;
type Scope = typeof GremlinProcess.scope;

interface Comparator<T> {
  compare(a: T, b: T): number;
}

export class GraphTraversal<S = any, E = any> extends Traversal<S, E> {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  constructor(
    graph: Nullable<Graph>,
    traversalStrategies: Nullable<TraversalStrategies>,
    bytecode: Bytecode
  );

  /**
   * Clone this traversal.
   */
  clone(): this;
  /**
   * Start a vertex traversal.
   */
  V<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;
  /**
   * Traverses to the specified vertices.
   */
  // ? The return type could be the last vertex in the array
  V<OutVertex extends Vertex = Vertex>(...otherVertices: Array<Long | Vertex>): GraphTraversal<S, OutVertex>;

  /**
   * Adds a `Vertex` with a default vertex label.
   */
  addV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Adds a `Vertex` with the specified vertex label.
   */
  addV<OutVertex extends Vertex = Vertex>(vertexLabel: string): GraphTraversal<S, OutVertex>;

  /**
   * Adds a `Vertex` with a vertex label determined by a `Traversal`.
   */
  addV<S, OutVertex extends Vertex = Vertex>(traversal: Traversal<S, string>): GraphTraversal<S, OutVertex>;

  /**
   * Adds an edge with the specified edge label.
   */
  addE(vertexLabel: string): this;

  /**
   * Adds an edge with a edge label determined by a `Traversal`.
   */
  addE<S>(traversal: Traversal<S, string>): this;

  /**
   * Eagerly collects objects up to this step into a side-effect.
   */
  aggregate(sideFxKey: string): GraphTraversal<S, E>;

  /**
   * Collects objects in a list using the `scope` argument to
   * determine how it should gather those objects.
   * @param scope The scope of the aggregation.
   *  - `Scope.global` - Gathers eagerly.
   *  - `Scope.local` - Gathers lazily.
   * @param sideFxKey The side-effect key to store the aggregation.
   */
  aggregate(scope: Scope, sideFxKey: string): GraphTraversal<S, E>;

  /**
   * Ensures that all of the provided traversals yield a result.
   */
  and(...traversals: Array<Traversal<?, ?>>): GraphTraversal<S, E>;

  /**
   * A step modulator that provides a label to the step that can be accessed
   * later in the traversal by other steps.
   */
  as(stepLabel: string, ...stepLabels: string[]): GraphTraversal<S, E>;

  /**
   * Turns the lazy traversal pipeline into a bulk-synchronous pipeline
   * which basically iterates that traversal to the size of the barrier.
   */
  barrier(barrierConsumer: Fn<Set<Traverser<E>>>): GraphTraversal<S, E>;

  /**
   * Map the {@link Vertex} to its adjacent vertices given the edge labels.
   */
  both<OutVertex extends Vertex = Vertex>(...edgeLabels: string[]): GraphTraversal<S, OutVertex>;

  /**
   * Map the {@link Vertex} to its incident edges given the edge labels.
   */
  bothE<OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Map the {@link Edge} to its incident vertices.
   */
  bothV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Splits the {@link Traverser} into all specified functions.
   */
  branch<M, E2>(fn: Fn<Traverser<S>, M>): GraphTraversal<S, E2>;

  /**
   * Splits the {@link Traverser} into all specified traversals.
   */
  branch<M, E2>(branchTraversal: Traversal<?, M>): GraphTraversal<S, E2>;

  /**
   * Can be applied to a number of different step to alter their behaviors.
   */
  by(): GraphTraversal<S, E>;

  by(key: string): GraphTraversal<S, E>;

  by<V>(key: string, comparator: Comparator<V>): GraphTraversal<S, E>;

  by(comparator: Comparator<E>): GraphTraversal<S, E>;

  by<U, V>(fn: Fn<U, V>, comparator: Comparator<V>): GraphTraversal<S, E>;

  by<U, V>(fn: Fn<U, V>): GraphTraversal<S, E>;

  by(order: Order): GraphTraversal<S, E>;

  by(traversal: Traversal<?, ?>): GraphTraversal<S, E>;

  by<V>(traversal: Traversal<?, ?>, comparator: Comparator<V>): GraphTraversal<S, E>;

  by(token: Token): GraphTraversal<S, E>;

  /**
   * Perform the specified service call with no parameters.
   */
  call<E>(service: string): GraphTraversal<S, E>;

  /**
   * Perform the specified service call with the specified static parameters.
   */
  call<E>(service: string, params: Record<?, ?>): GraphTraversal<S, E>;

  /**
   * Perform the specified service call with both static and dynamic parameters produced by the specified child traversal.
   */
  call<E>(
    service: string,
    params: Record<?, ?>,
    childTraversal: Traversal<?, Record<?, ?>>
  ): GraphTraversal<S, E>;

  /**
   * Iterates the traversal up to the itself and emits the side-effect referenced by the key.
   */
  cap<E2>(sideEffectKey: string, ...sideEffectKeys: string[]): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<M, E2>(choiceFunction: Fn<E, M>): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<E2>(choosePredicate: Predicate<E>, trueChoice: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<E2>(
    choosePredicate: Predicate<E>,
    trueChoice: Traversal<?, E2>,
    falseChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<E2>(
    traversalPredicate: Traversal<?, boolean>,
    trueChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<E2>(
    traversalPredicate: Traversal<?, boolean>,
    trueChoice: Traversal<?, E2>,
    falseChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<M, E2>(choiceTraversal: Traversal<?, M>): GraphTraversal<S, E2>;

  /**
   * Evaluates the provided traversals and returns the result of the first traversal to emit at least one object.
   */
  coalesce<E2>(...coalesceTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, E2>;

  /**
   * Filter the E object given a biased coin toss.
   */
  coin(probability: number): GraphTraversal<S, E>;

  /**
   * Executes a Connected Component algorithm over the graph.
   */
  connectedComponent(): GraphTraversal<S, E>;

  /**
   * Map any object to a fixed E value.
   */
  constant<E2>(e: E2): GraphTraversal<S, E2>;

  /**
   * Map the traversal stream to its reduction as a sum of the `Traverser.bulk()` values (i.e. count the number of traversers up to this point).
   */
  count(): GraphTraversal<S, Long>;

  /**
   * Map the traversal stream to its reduction as a sum of the `Traverser.bulk()` values given the specified Scope.
   */
  count(scope: Scope): GraphTraversal<S, Long>;

  /**
   * Filter the E object if its `Traverser.path()` is `Path.isSimple()`.
   */
  cyclicPath(): GraphTraversal<S, E>;

  /**
   * Remove all duplicates in the traversal stream up to this point.
   */
  dedup(...dedupLabels: string[]): GraphTraversal<S, E>;

  dedup(scope: Scope, ...dedupLabels: string[]): GraphTraversal<S, E>;

  /**
   * Removes elements and properties from the graph.
   */
  drop(): GraphTraversal<S, E>;

  /**
   * Map a Property to its Element.
   */
  element(): GraphTraversal<S, E>;

  /**
   *  Map the Element to a Map of the property values key'd according to their Property.key().
   */
  elementMap(...propertyKeys: string[]): GraphTraversal<S, Record<?, E>>;

  /**
   * Emit is used in conjunction with repeat(Traversal) to emit all objects from the loop.
   */
  emit(): GraphTraversal<S, E>;

  /**
   * Emit is used in conjunction with repeat(Traversal) to determine what objects get emit from the loop.
   */
  emit(emitPredicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  emit(emitTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * When triggered, immediately throws a runtime exception.
   */
  fail(): GraphTraversal<S, E>;

  fail(message: string): GraphTraversal<S, E>;

  /**
   * Map the Traverser to either true or false, where false will not pass the traverser to the next step.
   */
  filter(predicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  filter(filterTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Map a Traverser referencing an object of type `E` to an iterator of objects of type `E2`.
   */

  flatMap<E2>(fn: Fn<E, Iterable<E2>>): GraphTraversal<S, E2>;

  flatMap<E2>(flatMapTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Rolls up objects in the stream into an aggregate list.
   */
  fold(): GraphTraversal<S, E[]>;

  /**
   * Rolls up objects in the stream into an aggregate value as defined by a seed and BiFunction.
   */
  fold<E2>(seed: E2, foldFunction: Fn<[E2, E], E2>): GraphTraversal<S, E2>;

  /**
   * Provide from()-modulation to respective steps.
   */
  from_(fromStepLabel?: string): GraphTraversal<S, E>;

  /**
   * When used as a modifier to addE(String) this method specifies the traversal to use for selecting the outgoing vertex of the newly added Edge.
   */
  from_(fromVertex: Traversal<?, Vertex>): GraphTraversal<S, E>;

  from_(fromVertex: Vertex): GraphTraversal<S, E>;

  /**
   * Organize objects in the stream into a Map.
   */
  group<K, V>(): GraphTraversal<S, Record<K, V>>;

  group(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Counts the number of times a particular objects has been part of a traversal, returning a Map where the object is the key and the value is the count.
   */
  groupCount<K>(): GraphTraversal<S, Record<K, Long>>;

  groupCount(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on the existence of properties.
   */
  has(propertyKey: string): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their properties.
   */
  has(propertyKey: string, value: ?): GraphTraversal<S, E>;

  has(propertyKey: string, predicate: Predicate<E>): GraphTraversal<S, E>;

  has(propertyKey: string, propertyTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  has(accessor: Token, value: ?): GraphTraversal<S, E>;

  has(accessor: Token, predicate: Predicate<E>): GraphTraversal<S, E>;

  has(accessor: Token, propertyTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their identifier.
   */
  hasId(id: Long, ...otherIds: Long[]): GraphTraversal<S, E>;

  hasId(predicate: Predicate<Long>): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their key.
   */
  hasKey(label: string, ...otherLabels: string[]): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their key.
   */
  hasKey(predicate: Predicate<string>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their label.
   */
  hasLabel(label: string, ...otherLabels: string[]): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their label.
   */
  hasLabel(predicate: Predicate<string>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on the non-existence of properties.
   */
  hasNot(propertyKey: string): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their value.
   */
  hasValue(value: ?, ...otherValues: ?[]): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their value.
   */
  hasValue(predicate: Predicate<?>): GraphTraversal<S, E>;

  /**
   * Map the Element to its Element.id().
   */
  id(): GraphTraversal<S, Long>;

  /**
   * Map the E object to itself.
   */
  identity(): GraphTraversal<S, E>;

  /**
   * Map the Vertex to its incoming adjacent vertices given the edge labels.
   */
  in_<OutVertex extends Vertex = Vertex>(...edgeLabels: string[]): GraphTraversal<S, OutVertex>;

  /**
   * Indexes all items of the current collection.
   */
  index<E2>(): GraphTraversal<S, E2>;

  /**
   * Map the Vertex to its incoming incident edges given the edge labels.
   */
  inE<OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Provides a way to add arbitrary objects to a traversal stream.
   */
  inject(...injections: E[]): GraphTraversal<S, E>;

  /**
   * Map the Edge to its incoming/head incident Vertex.
   */
  inV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Filter the E object if it is not equal to the provided value.
   */
  is(value: ?): GraphTraversal<S, E>;

  /**
   * Filters E object values given the provided predicate.
   */
  is(predicate: Predicate<E>): GraphTraversal<S, E>;

  // ! Mismatched runtime types
  // /**
  //  * Iterates the traversal presumably for the generation of side-effects.
  //  */
  // iterate(): GraphTraversal2<S, E>;

  /**
   * Map the Property to its keys.
   */
  key(): GraphTraversal<S, string>;

  /**
   * Map the Element to its labels.
   */
  label(): GraphTraversal<S, string>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream, where only the first n objects are allowed as defined by the limit argument.
   */
  limit(limit: number): GraphTraversal<S, E>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream given the Scope, where only the first n objects are allowed as defined by the limit argument.
   */
  limit(scope: Scope, limit: number): GraphTraversal<S, E>;

  /**
   * Provides a execute a specified traversal on a single element within a stream.
   */
  local<E2>(localTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * If the Traverser supports looping then calling this method will extract the number of loops for that traverser.
   */
  loops(): GraphTraversal<S, number>;

  /**
   * If the Traverser supports looping then calling this method will extract the number of loops for that traverser for the named loop.
   */
  loops(loopName: string): GraphTraversal<S, number>;

  /**
   * Map the Element to its associated properties.
   */
  map(): GraphTraversal<S, Record<string, E>>;

  /**
   * Map a Traverser referencing an object of type E to an object of type E2.
   */
  map<E2>(fn: Fn<Traverser<E>, E2>): GraphTraversal<S, E2>;

  map<E2>(mapTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map of bindings as specified by the provided match traversals.
   */
  match<E2>(...matchTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, Record<string, E2>>;

  /**
   * Map the Traverser to a Double according to the mathematical expression provided in the argument.
   */
  math(expression: string): GraphTraversal<S, number>;

  /**
   * Determines the largest value in the stream.
   */
  max<E2 extends Comparable>(): GraphTraversal<S, E2>;

  /**
   * Determines the largest value in the stream given the Scope.
   */
  max<E2 extends Comparable>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Determines the mean value in the stream.
   */

  mean<E2 extends number>(): GraphTraversal<S, E2>;

  /**
   * Determines the mean value in the stream given the Scope.
   */

  mean<E2 extends number>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Spawns a GraphTraversal by doing a merge (i.e. upsert) style operation for an Edge using an incoming Map as an argument.
   */
  mergeE<OutEdge extends Edge = Edge>(): GraphTraversal<S, OutEdge>;

  /**
   * Spawns a GraphTraversal by doing a merge (i.e. upsert) style operation for an Edge using a Map as an argument.
   */
  mergeE<OutEdge extends Edge = Edge>(searchCreate: Record<?, ?>): GraphTraversal<S, OutEdge>;

  mergeE<OutEdge extends Edge = Edge>(
    searchCreate: Traversal<?, Record<?, ?>>
  ): GraphTraversal<S, OutEdge>;

  /**
   * Performs a merge.
   */
  mergeV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  mergeV<OutVertex extends Vertex = Vertex>(searchCreate: Record<?, ?>): GraphTraversal<S, OutVertex>;

  mergeV<OutVertex extends Vertex = Vertex>(searchCreate: Traversal<?, Record<?, ?>>): GraphTraversal<S, OutVertex>;

  /**
   * Determines the smallest value in the stream.
   */
  min<E2 extends Comparable>(): GraphTraversal<S, E2>;

  /**
   * Determines the smallest value in the stream given the Scope.
   */
  min<E2 extends Comparable>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Filter all traversers in the traversal.
   */
  none(): GraphTraversal<S, E>;

  /**
   * Removes objects from the traversal stream when the traversal provided as an argument returns any objects.
   */
  not(notTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * This is a step modulator to a TraversalOptionParent like `choose()` or `mergeV()` where the provided argument associated to the token is applied according to the semantics of the step.
   */
  option<M, E2>(token: M, m: Record<?, ?>): GraphTraversal<S, E>;

  option<M, E2>(token: M, traversalOption: Traversal<?, E2>): GraphTraversal<S, E>;

  option<M, E2>(merge: Merge, m: Record<?, ?>, cardinality: VertexCardinality): GraphTraversal<S, E>;

  option<E2>(merge: Merge, traversalOption: Traversal<?, E2>, cardinality: VertexCardinality): GraphTraversal<S, E>;

  /**
   * Returns the result of the specified traversal if it yields a result, otherwise it returns the calling element.
   */
  optional<E2>(optionalTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Ensures that at least one of the provided traversals yield a result.
   */
  or(...orTraversals: Array<Traversal<?, ?>>): GraphTraversal<S, E>;

  /**
   * Order all the objects in the traversal up to this point and then emit them one-by-one in their ordered sequence.
   */
  order(): GraphTraversal<S, E>;

  /**
   * Order either the Scope.local object (e.g. a list, map, etc.) or the entire Scope.global traversal stream.
   */
  order(scope: Scope): GraphTraversal<S, E>;

  /**
   * Map the Edge to the incident vertex that was not just traversed from in the path history.
   */
  otherV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Map the Vertex to its outgoing adjacent vertices given the edge labels.
   */
  out<OutVertex extends Vertex = Vertex>(...edgeLabels: string[]): GraphTraversal<S, OutVertex>;

  /**
   * Map the Vertex to its outgoing incident edges given the edge labels.
   */
  outE<OutEdge extends Edge = Edge>(edgeLabel?: string): GraphTraversal<S, OutEdge>;

  outE<OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Map the Edge to its outgoing/tail incident Vertex.
   */
  outV<OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Calculates a PageRank over the graph using a 0.85 for the alpha value.
   */
  pageRank(): GraphTraversal<S, E>;

  /**
   * Calculates a PageRank over the graph.
   */
  pageRank(alpha: number): GraphTraversal<S, E>;

  /**
   * Map the Traverser to its Path history via Traverser.path().
   */
  path(): GraphTraversal<S, E>;

  /**
   * Executes a Peer Pressure community detection algorithm over the graph.
   */
  peerPressure(): GraphTraversal<S, E>;

  /**
   * Allows developers to examine statistical information about a traversal providing data like execution times, counts, etc.
   */
  profile(): GraphTraversal<S, TraversalMetrics>;
  profile(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Executes an arbitrary VertexProgram over the graph.
   */
  program(vertexProgram: VertexProgram<?>): GraphTraversal<S, E>;

  /**
   * Projects the current object in the stream into a Map that is keyed by the provided labels.
   */
  project<E2>(
    projectKey: string,
    ...otherProjectKeys: string[]
  ): GraphTraversal<S, Record<string, E2>>;

  /**
   * Map the Element to its associated properties given the provide property keys.
   */
  properties<E2 extends Record<string, ?>>(
    ...propertyKeys: string[]
  ): GraphTraversal<S, /* ? extends Property<E2> */ E2>;

  /**
   * Sets the key and value of a Property.
   */
  property(key: string, value: ?, ...keyValues: ?[]): GraphTraversal<S, E>;

  /**
   * When a Map is supplied then each of the key/value pairs in the map will be added as property.
   */
  property(value: Record<?, ?>): GraphTraversal<S, E>;

  /**
   * Sets a Property value and related meta properties if supplied, if supported by the Graph and if the Element is a VertexProperty.
   */
  property(
    cardinality: VertexProperty.Cardinality,
    key: string,
    value: ?,
    ...keyValues: ?[]
  ): GraphTraversal<S, E>;

  /**
   * Map the Element to a Map of the properties key'd according to their property keys.
   */
  propertyMap<E2>(...propertyKeys: string[]): GraphTraversal<S, Record<string, E2>>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream.
   */
  range(low: number, high: number): GraphTraversal<S, E>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream as constrained by the Scope.
   */
  range<E2>(scope: Scope, low: number, high: number): GraphTraversal<S, E2>;

  /**
   * This step is technically a step modulator for the the GraphTraversalSource.io(String) step which instructs the step to perform a read with its given configuration.
   */
  read(): GraphTraversal<S, E>;

  /**
   * This step is used for looping over a traversal given some break predicate and with a specified loop name.
   */
  repeat(loopName: string, repeatTraversal: Traversal<?, E>): GraphTraversal<S, E>;

  /**
   * This step is used for looping over a traversal given some break predicate.
   */
  repeat(repeatTraversal: Traversal<?, E>): GraphTraversal<S, E>;

  /**
   * Maps the Traverser to its Traverser.sack() value.
   */
  sack<E2>(): GraphTraversal<S, E>;

  /**
   * Map the Traverser to its Traverser.sack() value.
   */
  sack<V, U>(sackOperator: Fn<[V, U], V>): GraphTraversal<S, E>;

  /**
   * Allow some specified number of objects to pass through the stream.
   */
  sample(amountToSample: number): GraphTraversal<S, E>;

  /**
   * Allow some specified number of objects to pass through the stream.
   */
  sample(scope: Scope, amountToSample: number): GraphTraversal<S, E>;

  /**
   * Map the Traverser to the object specified by the selectKey.
   */
  select<E2>(selectKey: string): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map projection of sideEffect values, map values, and/or path values.
   */
  select<E2>(
    selectKey1: string,
    selectKey2: string,
    ...otherSelectKeys: string[]
  ): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to the object specified by the selectKey and apply the Pop operation to it.
   */
  select<E2>(pop: Pop, selectKey: string): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map projection of sideEffect values, map values, and/or path values.
   */
  select<E2>(
    pop: Pop,
    selectKey1: string,
    selectKey2: string,
    ...otherSelectKeys: string[]
  ): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to the object specified by the key returned by the keyTraversal.
   */
  select<E2>(keyTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * A version of select that allows for the extraction of a Column from objects in the traversal.
   */
  select<E2>(column: Column): GraphTraversal<S, E2>;

  /**
   * Executes a Shortest Path algorithm over the graph.
   */
  shortestPath(): GraphTraversal<S, Path>;

  /**
   * Perform some operation on the Traverser and pass it to the next step unmodified.
   */
  sideEffect(consumer: Fn<[Traverser<E>]>): GraphTraversal<S, E>;
  sideEffect(sideEffectTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Filter the E object if its Traverser.path() is not Path.isSimple().
   */
  simplePath(): GraphTraversal<S, E>;

  /**
   * Filters out the first n objects in the traversal.
   */
  skip(skip: number): GraphTraversal<S, E>;
  skip(scope: Scope, skip: number): GraphTraversal<S, E>;

  /**
   * Eagely collects objects up to this step into a side-effect.
   * @deprecated [From Java] As of release 3.4.3, replaced by `aggregate(Scope, String)` using `Scope.LOCAL`.
   */
  store(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Extracts a portion of the graph being traversed into a Graph object held in the specified side-effect key.
   */
  subgraph<OutEdge extends Edge = Edge>(sideEffectKey: string): GraphTraversal<S, OutEdge>;

  /**
   * Map the traversal stream to its reduction as a sum of the Traverser.get() values multiplied by their `Traverser.bulk()`.
   */
  sum<E2 extends number>(): GraphTraversal<S, E2>;

  /**
   * Map the traversal stream to its reduction as a sum of the Traverser.get() values multiplied by their `Traverser.bulk()` given the specified Scope.
   */
  sum<E2 extends number>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream.
   */
  tail<E2>(): GraphTraversal<S, E2>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream.
   */
  tail<E2>(limit: number): GraphTraversal<S, E2>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream given the Scope.
   */
  tail<E2>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream given the Scope.
   */
  tail<E2>(scope: Scope, limit: number): GraphTraversal<S, E2>;

  /**
   * Once the first Traverser hits this step, a count down is started.
   */
  timeLimit(timeLimit: number): GraphTraversal<S, E>;

  /**
   * Modifies a repeat(Traversal) to specify how many loops should occur before exiting.
   */
  times(maxLoops: number): GraphTraversal<S, E>;

  /**
   * Provide to()-modulation to respective steps.
   */
  to(toStepLabel: string): GraphTraversal<S, E>;

  /**
   * When used as a modifier to addE(String) this method specifies the traversal to use for selecting the incoming vertex of the newly added Edge.
   */
  to(toVertex: Traversal<?, Vertex>): GraphTraversal<S, E>;

  /**
   * Map the Vertex to its adjacent vertices given a direction and edge labels.
   */
  to(direction: Direction, ...edgeLabels: string[]): GraphTraversal<S, E>;

  /**
   * When used as a modifier to addE(String) this method specifies the traversal to use for selecting the incoming vertex of the newly added Edge.
   */
  to(toVertex: Vertex): GraphTraversal<S, E>;

  /**
   * Map the Vertex to its incident edges given the direction and edge labels.
   */
  toE<OutEdge extends Edge = Edge>(direction: Direction, ...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Map the Edge to its incident vertices given the direction.
   */
  toV<OutVertex extends Vertex = Vertex>(direction?: Direction): GraphTraversal<S, OutVertex>;

  /**
   * Aggregates the emanating paths into a Tree data structure.
   */
  tree(): GraphTraversal<S, E>;

  /**
   * Aggregates the emanating paths into a Tree data structure.
   */
  tree(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Unrolls a Iterator, Iterable or Map into a linear form or simply emits the object if it is not one of those types.
   */
  unfold<E2>(): GraphTraversal<S, E2>;

  /**
   * Merges the results of an arbitrary number of traversals.
   */
  union<E2>(...unionTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, E2>;

  /**
   * Modifies a repeat(Traversal) to determine when the loop should exit.
   */
  until(untilPredicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  /**
   * Modifies a repeat(Traversal) to determine when the loop should exit.
   */
  until(untilTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Map the properties to its value.
   */
  value(): GraphTraversal<S, E>;

  /**
   * Map the Property to its Property.value().
   * @deprecated [From Java] As of release 3.4.0, deprecated in favor of `valueMap(String...)` in conjunction with `with(String, Object)` or simple prefer `elementMap(String...)`.
   */
  valueMap<E2>(includeTokens: boolean, ...propertyKeys: string[]): GraphTraversal<S, Record<?, E2>>;

  /**
   * Map the Property to its Property.value().
   */
  valueMap<E2>(...propertyKeys: string[]): GraphTraversal<S, Record<?, E2>>;

  /**
   * Map the Element to the values of the associated properties given the provide property keys.
   */
  values<E2>(...propertyKeys: string[]): GraphTraversal<S, E2>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where(startKey: string, predicate: P<string>): GraphTraversal<S, E>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where(predicate: P<string>): GraphTraversal<S, E>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where(whereTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Provides a configuration to a step in the form of a key which is the same as with(key, true).
   */
  with_(key: string): GraphTraversal<S, E>;

  /**
   * Provides a configuration to a step in the form of a key and value pair.
   */
  with_(key: string, value: ?): GraphTraversal<S, E>;

  /**
   * This step is technically a step modulator for the the GraphTraversalSource.io(String) step which instructs the step to perform a write with its given configuration.
   */
  write(): GraphTraversal<S, E>;
}

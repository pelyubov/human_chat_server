// ! This definition however, may not be accurate and needed to use with caution.
// ! When encountering mismatched runtime types, consider filing an issue.

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { GraphTraversal } from './graph-traversal';
import { Traversal } from './traversal';
import { Traverser } from './traverser';
import { Edge } from './types';
import { Vertex2 as Vertex } from './vertex';
import { Long } from '@Project.Utils/types';
import { Scope } from './scope';
import { Predicate } from './predicate';

export interface StaticSource {
  /**
   * Start a vertex traversal.
   */
  V<OutVertex extends Vertex = Vertex>(): GraphTraversal<OutVertex, OutVertex>;
  /**
   * Traverses to the specified vertices.
   */
  V<OutVertex extends Vertex = Vertex>(...otherVertices: Array<Long | Vertex>): GraphTraversal<?, OutVertex>;

  /**
   * Adds a `Vertex` with a default vertex label.
   */
  addV<OutVertex extends Vertex = Vertex>(): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Adds a `Vertex` with the specified vertex label.
   */
  addV<OutVertex extends Vertex = Vertex>(vertexLabel: string): GraphTraversal<OutVertex, OutVertex>;

  /**
   * Adds a `Vertex` with a vertex label determined by a `Traversal`.
   */
  addV<S, OutVertex extends Vertex = Vertex>(traversal: Traversal<S, string>): GraphTraversal<S, OutVertex>;

  /**
   * Adds an edge with the specified edge label.
   */
  addE<OutEdge extends Edge = Edge>(vertexLabel: string): GraphTraversal<OutEdge, OutEdge>;

  /**
   * Adds an edge with a edge label determined by a `Traversal`.
   */
  addE<S, OutEdge extends Edge = Edge>(traversal: Traversal<S, string>): GraphTraversal<S, OutEdge>;

  /**
   * Eagerly collects objects up to this step into a side-effect.
   */
  aggregate<S, E>(sideFxKey: string): GraphTraversal<S, E>;

  /**
   * Collects objects in a list using the `scope` argument to
   * determine how it should gather those objects.
   * @param scope The scope of the aggregation.
   *  - `Scope.global` - Gathers eagerly.
   *  - `Scope.local` - Gathers lazily.
   * @param sideFxKey The side-effect key to store the aggregation.
   */
  aggregate<S, E>(scope: Scope, sideFxKey: string): GraphTraversal<S, E>;

  /**
   * Ensures that all of the provided traversals yield a result.
   */
  and<S, E>(...traversals: Array<Traversal<?, ?>>): GraphTraversal<S, E>;

  /**
   * A step modulator that provides a label to the step that can be accessed
   * later in the traversal by other steps.
   */
  as<S, E>(stepLabel: string, ...stepLabels: string[]): GraphTraversal<S, E>;

  /**
   * Turns the lazy traversal pipeline into a bulk-synchronous pipeline
   * which basically iterates that traversal to the size of the barrier.
   */
  barrier<S, E>(barrierConsumer: Fn<Set<Traverser<E>>>): GraphTraversal<S, E>;

  /**
   * Map the {@link Vertex} to its adjacent vertices given the edge labels.
   */
  both<S, OutVertex extends Vertex = Vertex>(...edgeLabels: string[]): GraphTraversal<S, OutVertex>;

  /**
   * Map the {@link Vertex} to its incident edges given the edge labels.
   */
  bothE<OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<?, OutEdge>;

  /**
   * Map the {@link Edge} to its incident vertices.
   */
  bothV<S, OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Splits the {@link Traverser} into all specified functions.
   */
  branch<S, M, E2>(fn: Fn<Traverser<S>, M>): GraphTraversal<S, E2>;

  /**
   * Splits the {@link Traverser} into all specified traversals.
   */
  branch<S, M, E2>(branchTraversal: Traversal<S, M>): GraphTraversal<S, E2>;

  /**
   * Perform the specified service call with no parameters.
   */
  call<S, E>(service: string): GraphTraversal<S, E>;

  /**
   * Perform the specified service call with the specified static parameters.
   */
  call<S, E>(service: string, params: Record<?, ?>): GraphTraversal<S, E>;

  /**
   * Perform the specified service call with both static and dynamic parameters produced by the specified child traversal.
   */
  call<S, E>(
    service: string,
    params: Record<?, ?>,
    childTraversal: Traversal<?, Record<?, ?>>
  ): GraphTraversal<S, E>;

  /**
   * Iterates the traversal up to the itself and emits the side-effect referenced by the key.
   */
  cap<S, E2>(sideEffectKey: string, ...sideEffectKeys: string[]): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<S, M, E2>(choiceFunction: Fn<E, M>): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<S, E2>(choosePredicate: Predicate<E>, trueChoice: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<S, E, E2>(
    choosePredicate: Predicate<E>,
    trueChoice: Traversal<?, E2>,
    falseChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<S, E2>(
    traversalPredicate: Traversal<?, boolean>,
    trueChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then-else like semantics within a traversal.
   */
  choose<S, E2>(
    traversalPredicate: Traversal<?, boolean>,
    trueChoice: Traversal<?, E2>,
    falseChoice: Traversal<?, E2>
  ): GraphTraversal<S, E2>;

  /**
   * Routes the current traverser to a particular traversal branch option which allows the creation of if-then like semantics within a traversal.
   */
  choose<S, M, E2>(choiceTraversal: Traversal<?, M>): GraphTraversal<S, E2>;

  /**
   * Evaluates the provided traversals and returns the result of the first traversal to emit at least one object.
   */
  coalesce<S, E2>(...coalesceTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, E2>;

  /**
   * Filter the E object given a biased coin toss.
   */
  coin<S, E>(probability: number): GraphTraversal<S, E>;

  /**
   * Map any object to a fixed E value.
   */
  constant<S, E2>(e: E2): GraphTraversal<S, E2>;

  /**
   * Map the traversal stream to its reduction as a sum of the `Traverser.bulk()` values (i.e. count the number of traversers up to this point).
   */
  count<S>(): GraphTraversal<S, Long>;

  /**
   * Map the traversal stream to its reduction as a sum of the `Traverser.bulk()` values given the specified Scope.
   */
  count<S>(scope: Scope): GraphTraversal<S, Long>;

  /**
   * Filter the E object if its `Traverser.path()` is `Path.isSimple()`.
   */
  cyclicPath<S, E>(): GraphTraversal<S, E>;

  /**
   * Remove all duplicates in the traversal stream up to this point.
   */
  dedup<S, E>(...dedupLabels: string[]): GraphTraversal<S, E>;

  dedup<S, E>(scope: Scope, ...dedupLabels: string[]): GraphTraversal<S, E>;

  /**
   * Removes elements and properties from the graph.
   */
  drop<S, E>(): GraphTraversal<S, E>;

  /**
   *  Map the Element to a Map of the property values key'd according to their Property.key().
   */
  elementMap<S, E>(...propertyKeys: string[]): GraphTraversal<S, Record<?, E>>;

  /**
   * Emit is used in conjunction with repeat(Traversal) to emit all objects from the loop.
   */
  emit<S, E>(): GraphTraversal<S, E>;

  /**
   * Emit is used in conjunction with repeat(Traversal) to determine what objects get emit from the loop.
   */
  emit<S, E>(emitPredicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  emit<S, E>(emitTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * When triggered, immediately throws a runtime exception.
   */
  fail<S, E>(): GraphTraversal<S, E>;

  fail<S, E>(message: string): GraphTraversal<S, E>;

  /**
   * Map the Traverser to either true or false, where false will not pass the traverser to the next step.
   */
  filter<S, E>(predicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  filter<S, E>(filterTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Map a Traverser referencing an object of type `E` to an iterator of objects of type `E2`.
   */

  flatMap<S, E, E2>(fn: Fn<E, Iterable<E2>>): GraphTraversal<S, E2>;

  flatMap<S, E2>(flatMapTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Rolls up objects in the stream into an aggregate list.
   */
  fold<S, E>(): GraphTraversal<S, E[]>;

  /**
   * Rolls up objects in the stream into an aggregate value as defined by a seed and BiFunction.
   */
  fold<S, E, E2>(seed: E2, foldFunction: Fn<[E2, E], E2>): GraphTraversal<S, E2>;

  /**
   * Organize objects in the stream into a Map.
   */
  group<S, K, V>(): GraphTraversal<S, Record<K, V>>;

  group<S, E>(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Counts the number of times a particular objects has been part of a traversal, returning a Map where the object is the key and the value is the count.
   */
  groupCount<S, K>(): GraphTraversal<S, Record<K, Long>>;

  groupCount<S, E>(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on the existence of properties.
   */
  has<S, E>(propertyKey: string): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their properties.
   */
  has<S, E>(propertyKey: string, value: object): GraphTraversal<S, E>;

  has<S, E>(propertyKey: string, predicate: Predicate<E>): GraphTraversal<S, E>;

  has<S, E>(propertyKey: string, propertyTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  has<S, E>(accessor: Token, value: object): GraphTraversal<S, E>;

  has<S, E>(accessor: Token, predicate: Predicate<E>): GraphTraversal<S, E>;

  has<S, E>(accessor: Token, propertyTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their identifier.
   */
  hasId<S, E>(id: Long, ...otherIds: Long[]): GraphTraversal<S, E>;

  hasId<S, E>(predicate: Predicate<Long>): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their key.
   */
  hasKey<S, E>(label: string, ...otherLabels: string[]): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their key.
   */
  hasKey<S, E>(predicate: Predicate<string>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their label.
   */
  hasLabel<S, E>(label: string, ...otherLabels: string[]): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on their label.
   */
  hasLabel<S, E>(predicate: Predicate<string>): GraphTraversal<S, E>;

  /**
   * Filters vertices, edges and vertex properties based on the non-existence of properties.
   */
  hasNot<S, E>(propertyKey: string): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their value.
   */
  hasValue<S, E>(value: object, ...otherValues: object[]): GraphTraversal<S, E>;

  /**
   * Filters Property objects based on their value.
   */
  hasValue<S, E>(predicate: Predicate<object>): GraphTraversal<S, E>;

  /**
   * Map the Element to its identifier.
   */
  id<S>(): GraphTraversal<S, Long>;

  /**
   * Map the 1 object to itself.
   */
  identity<S, E>(): GraphTraversal<S, E>;

  /**
   * Indexes all items of the current collection.
   */
  index<E2>(): GraphTraversal<S, E2>;

  /**
   * Map the Vertex to its incoming incident edges given the edge labels.
   */
  inE<S, OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Provides a way to add arbitrary objects to a traversal stream.
   */
  inject<S, E>(...injections: E[]): GraphTraversal<S, E>;

  /**
   * Map the Edge to its incoming/head incident Vertex.
   */
  inV<S, OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Filter the E object if it is not equal to the provided value.
   */
  is<S, E>(value: ?): GraphTraversal<S, E>;

  /**
   * Filters E object values given the provided predicate.
   */
  is<S, E>(predicate: Predicate<E>): GraphTraversal<S, E>;

  /**
   * Map the Property to its keys.
   */
  key<S>(): GraphTraversal<S, string>;

  /**
   * Map the Element to its labels.
   */
  label<S>(): GraphTraversal<S, string>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream, where only the first n objects are allowed as defined by the limit argument.
   */
  limit<S, E>(limit: number): GraphTraversal<S, E>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream given the Scope, where only the first n objects are allowed as defined by the limit argument.
   */
  limit<S, E>(scope: Scope, limit: number): GraphTraversal<S, E>;

  /**
   * Provides a execute a specified traversal on a single element within a stream.
   */
  local<S, E2>(localTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * If the Traverser supports looping then calling this method will extract the number of loops for that traverser.
   */
  loops<S>(): GraphTraversal<S, number>;

  /**
   * If the Traverser supports looping then calling this method will extract the number of loops for that traverser for the named loop.
   */
  loops<S>(loopName: string): GraphTraversal<S, number>;

  /**
   * Map the Element to its associated properties.
   */
  map<S, E>(): GraphTraversal<S, Record<string, E>>;

  /**
   * Map a Traverser referencing an object of type E to an object of type E2.
   */
  map<S, E, E2>(fn: Fn<Traverser<E>, E2>): GraphTraversal<S, E2>;

  map<S, E2>(mapTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map of bindings as specified by the provided match traversals.
   */
  match<S, E2>(...matchTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, Record<string, E2>>;

  /**
   * Map the Traverser to a Double according to the mathematical expression provided in the argument.
   */
  math<S>(expression: string): GraphTraversal<S, number>;

  /**
   * Determines the largest value in the stream.
   */
  max<S, E2 /* extends Comparable */>(): GraphTraversal<S, E2>;

  /**
   * Determines the largest value in the stream given the Scope.
   */
  max<S, E2 /* extends Comparable */>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Determines the mean value in the stream.
   */

  mean<S, E2 extends number>(): GraphTraversal<S, E2>;

  /**
   * Determines the mean value in the stream given the Scope.
   */

  mean<S, E2 extends number>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Spawns a GraphTraversal by doing a merge (i.e. upsert) style operation for an Edge using an incoming Map as an argument.
   */
  mergeE<S, OutEdge extends Edge = Edge>(): GraphTraversal<S, OutEdge>;

  /**
   * Spawns a GraphTraversal by doing a merge (i.e. upsert) style operation for an Edge using a Map as an argument.
   */
  mergeE<S, OutEdge extends Edge = Edge>(searchCreate: Record<?, ?>): GraphTraversal<S, OutEdge>;

  mergeE<S, OutEdge extends Edge = Edge>(searchCreate: Traversal<?, Record<?, ?>>): GraphTraversal<S, OutEdge>;

  /**
   * Performs a merge on the Vertex.
   */
  mergeV<S, OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  mergeV<S, OutVertex extends Vertex = Vertex>(searchCreate: Record<?, ?>): GraphTraversal<S, OutVertex>;

  mergeV<S, OutVertex extends Vertex = Vertex>(searchCreate: Traversal<?, Record<?, ?>>): GraphTraversal<S, OutVertex>;

  /**
   * Determines the smallest value in the stream.
   */
  min<S, E2 extends Comparable>(): GraphTraversal<S, E2>;

  /**
   * Determines the smallest value in the stream given the Scope.
   */
  min<S, E2 extends Comparable>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Removes objects from the traversal stream when the traversal provided as an argument returns any objects.
   */
  not<S, E>(notTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Returns the result of the specified traversal if it yields a result, otherwise it returns the calling element.
   */
  optional<S, E2>(optionalTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * Ensures that at least one of the provided traversals yield a result.
   */
  or<S, E>(...orTraversals: Array<Traversal<?, ?>>): GraphTraversal<S, E>;

  /**
   * Order all the objects in the traversal up to this point and then emit them one-by-one in their ordered sequence.
   */
  order<S, E>(): GraphTraversal<S, E>;

  /**
   * Order either the Scope.local object (e.g. a list, map, etc.) or the entire Scope.global traversal stream.
   */
  order<S, E>(scope: Scope): GraphTraversal<S, E>;

  /**
   * Map the Edge to the incident vertex that was not just traversed from in the path history.
   */
  otherV<S, OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Map the Vertex to its outgoing adjacent vertices given the edge labels.
   */
  out<S, OutVertex extends Vertex = Vertex>(...edgeLabels: string[]): GraphTraversal<S, OutVertex>;

  /**
   * Map the Vertex to its outgoing incident edges given the edge labels.
   */
  outE<S, OutEdge extends Edge = Edge>(edgeLabel?: string): GraphTraversal<S, OutEdge>;

  outE<S, OutEdge extends Edge = Edge>(...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Map the Edge to its outgoing/tail incident Vertex.
   */
  outV<S, OutVertex extends Vertex = Vertex>(): GraphTraversal<S, OutVertex>;

  /**
   * Map the Traverser to its Path history via Traverser.path().
   */
  path<S, E>(): GraphTraversal<S, E>;

  /**
   * Projects the current object in the stream into a Map that is keyed by the provided labels.
   */
  project<S, E2>(
    projectKey: string,
    ...otherProjectKeys: string[]
  ): GraphTraversal<S, Record<string, E2>>;

  /**
   * Map the Element to its associated properties given the provide property keys.
   */
  properties<S, E2 extends Record<string, ?>>(
    propertyKeys: string[]
  ): GraphTraversal<S, /* ? extends Property<E2> */ E2[keyof E2]>;

  /**
   * Sets the key and value of a Property.
   */
  property<S, E>(key: string, value: object, ...keyValues: object[]): GraphTraversal<S, E>;

  /**
   * When a Map is supplied then each of the key/value pairs in the map will be added as property.
   */
  property<S, E>(value: Record<object, object>): GraphTraversal<S, E>;

  /**
   * Sets a Property value and related meta properties if supplied, if supported by the Graph and if the Element is a VertexProperty.
   */
  property<S, E>(
    cardinality: VertexProperty.Cardinality,
    key: string,
    value: ?,
    ...keyValues: Array<?>
  ): GraphTraversal<S, E>;

  /**
   * Map the Element to a Map of the properties key'd according to their property keys.
   */
  propertyMap<S, E>(...propertyKeys: string[]): GraphTraversal<S, Record<string, E>>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream.
   */
  range<S, E>(low: number, high: number): GraphTraversal<S, E>;

  /**
   * Filter the objects in the traversal by the number of them to pass through the stream as constrained by the Scope.
   */
  range<S, E, E2>(scope: Scope, low: number, high: number): GraphTraversal<S, E>;

  /**
   * This step is used for looping over a traversal given some break predicate and with a specified loop name.
   */
  repeat<S, E>(loopName: string, repeatTraversal: Traversal<?, E>): GraphTraversal<S, E>;

  /**
   * This step is used for looping over a traversal given some break predicate.
   */
  repeat<S, E>(repeatTraversal: Traversal<?, E>): GraphTraversal<S, E>;

  /**
   * Maps the Traverser to its Traverser.sack() value.
   */
  sack<S, E, E2>(): GraphTraversal<S, E>;

  /**
   * Map the Traverser to its Traverser.sack() value.
   */
  sack<S, E, V, U>(sackOperator: Fn<[V, U], V>): GraphTraversal<S, E>;

  /**
   * Allow some specified number of objects to pass through the stream.
   */
  sample<S, E>(amountToSample: number): GraphTraversal<S, E>;

  /**
   * Allow some specified number of objects to pass through the stream.
   */
  sample<S, E>(scope: Scope, amountToSample: number): GraphTraversal<S, E>;

  /**
   * Map the Traverser to the object specified by the selectKey.
   */
  select<S, E2>(selectKey: string): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map projection of sideEffect values, map values, and/or path values.
   */
  select<S, E2>(
    selectKey1: string,
    selectKey2: string,
    ...otherSelectKeys: string[]
  ): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to the object specified by the selectKey and apply the Pop operation to it.
   */
  select<S, E2>(pop: Pop, selectKey: string): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to a Map projection of sideEffect values, map values, and/or path values.
   */
  select<S, E2>(
    pop: Pop,
    selectKey1: string,
    selectKey2: string,
    ...otherSelectKeys: string[]
  ): GraphTraversal<S, E2>;

  /**
   * Map the Traverser to the object specified by the key returned by the keyTraversal.
   */
  select<S, E2>(keyTraversal: Traversal<?, E2>): GraphTraversal<S, E2>;

  /**
   * A version of select that allows for the extraction of a Column from objects in the traversal.
   */
  select<S, E2>(column: Column): GraphTraversal<S, E2>;

  /**
   * Perform some operation on the Traverser and pass it to the next step unmodified.
   */
  sideEffect<S, E>(consumer: Fn<[Traverser<E>]>): GraphTraversal<S, E>;
  sideEffect<S, E>(sideEffectTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Filter the E object if its Traverser.path() is not Path.isSimple().
   */
  simplePath<S, E>(): GraphTraversal<S, E>;

  /**
   * Filters out the first n objects in the traversal.
   */
  skip<S, E>(skip: number): GraphTraversal<S, E>;
  skip<S, E>(scope: Scope, skip: number): GraphTraversal<S, E>;

  /**
   * Eagely collects objects up to this step into a side-effect.
   * @deprecated [From Java] As of release 3.4.3, replaced by `aggregate(Scope, String)` using `Scope.LOCAL`.
   */
  store<S, E>(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Extracts a portion of the graph being traversed into a Graph object held in the specified side-effect key.
   */
  subgraph<S, OutEdge extends Edge = Edge>(sideEffectKey: string): GraphTraversal<S, OutEdge>;

  /**
   * Map the traversal stream to its reduction as a sum of the Traverser.get() values multiplied by their `Traverser.bulk()`.
   */
  sum<S, E2 extends number>(): GraphTraversal<S, E2>;

  /**
   * Map the traversal stream to its reduction as a sum of the Traverser.get() values multiplied by their `Traverser.bulk()` given the specified Scope.
   */
  sum<S, E2 extends number>(scope: Scope): GraphTraversal<S, E2>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream.
   */
  tail<S, E>(): GraphTraversal<S, E>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream.
   */
  tail<S, E>(limit: number): GraphTraversal<S, E>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream given the Scope.
   */
  tail<S, E>(scope: Scope): GraphTraversal<S, E>;

  /**
   * Filters the objects in the traversal emitted as being last objects in the stream given the Scope.
   */
  tail<S, E>(scope: Scope, limit: number): GraphTraversal<S, E>;

  /**
   * Once the first Traverser hits this step, a count down is started.
   */
  timeLimit<S, E>(timeLimit: number): GraphTraversal<S, E>;

  /**
   * Modifies a repeat(Traversal) to specify how many loops should occur before exiting.
   */
  times<S, E>(maxLoops: number): GraphTraversal<S, E>;

  /**
   * Provide to()-modulation to respective steps.
   */
  to<S, E>(toStepLabel: string): GraphTraversal<S, E>;

  /**
   * When used as a modifier to addE(String) this method specifies the traversal to use for selecting the incoming vertex of the newly added Edge.
   */
  to<S, E>(toVertex: Traversal<?, Vertex>): GraphTraversal<S, E>;

  /**
   * Map the Vertex to its adjacent vertices given a direction and edge labels.
   */
  to<S, E>(direction: Direction, ...edgeLabels: string[]): GraphTraversal<S, E>;

  /**
   * When used as a modifier to addE(String) this method specifies the traversal to use for selecting the incoming vertex of the newly added Edge.
   */
  to<S, E>(toVertex: Vertex): GraphTraversal<S, E>;

  /**
   * Map the Vertex to its incident edges given the direction and edge labels.
   */
  toE<S, OutEdge extends Edge = Edge>(direction: Direction, ...edgeLabels: string[]): GraphTraversal<S, OutEdge>;

  /**
   * Map the Edge to its incident vertices given the direction.
   */
  toV<S, OutVertex extends Vertex = Vertex>(direction: Direction): GraphTraversal<S, OutVertex>;

  /**
   * Aggregates the emanating paths into a Tree data structure.
   */
  tree<S, E>(): GraphTraversal<S, E>;

  /**
   * Aggregates the emanating paths into a Tree data structure.
   */
  tree<S, E>(sideEffectKey: string): GraphTraversal<S, E>;

  /**
   * Unrolls a Iterator, Iterable or Map into a linear form or simply emits the object if it is not one of those types.
   */
  unfold<S, E>(): GraphTraversal<S, E>;

  /**
   * Merges the results of an arbitrary number of traversals.
   */
  union<S, E, E2>(...unionTraversals: Array<Traversal<?, E2>>): GraphTraversal<S, E>;

  /**
   * Modifies a repeat(Traversal) to determine when the loop should exit.
   */
  until<S, E>(untilPredicate: Predicate<Traverser<E>>): GraphTraversal<S, E>;

  /**
   * Modifies a repeat(Traversal) to determine when the loop should exit.
   */
  until<S, E>(untilTraversal: Traversal<?, ?>): GraphTraversal<S, E>;

  /**
   * Map the properties to its value.
   */
  value<S, E>(): GraphTraversal<S, E>;

  /**
   * Map the Property to its Property.value().
   * @deprecated [From Java] As of release 3.4.0, deprecated in favor of `valueMap(String...)` in conjunction with `with(String, Object)` or simple prefer `elementMap(String...)`.
   */
  valueMap<S, E>(
    includeTokens: boolean,
    ...propertyKeys: string[]
  ): GraphTraversal<S, Record<?, E>>;

  /**
   * Map the Property to its Property.value().
   */
  valueMap<S, E>(...propertyKeys: string[]): GraphTraversal<S, Record<?, E>>;

  /**
   * Map the Element to the values of the associated properties given the provide property keys.
   */
  values<S, E>(...propertyKeys: string[]): GraphTraversal<S, E>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where<S, E>(startKey: string, predicate: P<string>): GraphTraversal<S, E>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where<S, E>(predicate: Predicate<string>): GraphTraversal<S, E>;

  /**
   * Filters the current object based on the object itself or the path history.
   */
  where<S, E>(whereTraversal: Traversal<?, ?>): GraphTraversal<S, E>;
}

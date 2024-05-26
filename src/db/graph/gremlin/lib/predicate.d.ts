// ! This definition may not be accurate and should be used with caution.
// ! When encountering mismatched runtime types, consider filing an issue.

/* eslint-disable @typescript-eslint/no-misused-new */
import { process } from 'gremlin';

export class Predicate<V> {
  constructor(operator: process.EnumValue, value: V, other?: V): Predicate<V>;
  test(testValue: V): boolean;

  and<T extends V>(predicate: Predicate<T>): Predicate<V>;
  or<T extends V>(predicate: Predicate<T>): Predicate<V>;
  static eq<V>(value: V): Predicate<V>;
  static gt<V>(value: V): Predicate<V>;
  static gte<V>(value: V): Predicate<V>;
  static lt<V>(value: V): Predicate<V>;
  static lte<V>(value: V): Predicate<V>;
  static neq<V>(value: V): Predicate<V>;
  static not<V>(predicate: Predicate<V>): Predicate<V>;

  static between<V>(first: V, second: V): Predicate<V>;
  static inside<V>(first: V, second: V): Predicate<V>;
  static outside<V>(first: V, second: V): Predicate<V>;
  static within<V>(value: Iterable<V>): Predicate<V>;
  static within<V>(...values: V[]): Predicate<V>;
  static without<V>(value: Iterable<V>): Predicate<V>;
  static without<V>(...values: V[]): Predicate<V>;
}

import { types as DataStaxTypes } from 'cassandra-driver';
import { LongParseError } from './errors/LongParseError';

interface ILong {
  low: number;
  high: number;
  unsigned: boolean;
}

type LongLike = string | number | bigint | ILong;

type DsLong = InstanceType<typeof DataStaxTypes.Long>;
/**
 * A class that extends DataStax's `Long` type to support `BigInt`.
 */
export class Long2 extends DataStaxTypes.Long {
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as signed integers.
   *
   * See the `from*` functions below for more convenient ways of constructing `Longs`.
   * @param low The low (signed) 32 bits of the `Long`.
   * @param high The high (signed) 32 bits of the `Long`. Defaults to `0`.
   * @param unsigned Whether unsigned or not. Defaults to `false`.
   */
  constructor(low: number, high?: number, unsigned?: boolean) {
    super(low, high, unsigned);
  }
  add(addend: LongLike): Long2 {
    const rhs = Long2.fromValue(addend);
    return Long2.fromValue(super.add(rhs));
  }
  subtract(subtrahend: LongLike): Long2 {
    const rhs = Long2.fromValue(subtrahend);
    return Long2.fromValue(super.subtract(rhs));
  }
  sub(subtrahend: LongLike): Long2 {
    return this.subtract(subtrahend);
  }
  multiply(multiplier: LongLike): Long2 {
    const rhs = Long2.fromValue(multiplier);
    return Long2.fromValue(super.multiply(rhs));
  }
  mul(multiplier: string | number | DsLong): Long2 {
    return this.multiply(multiplier);
  }
  divide(divisor: LongLike): Long2 {
    const rhs = Long2.fromValue(divisor);
    return Long2.fromILong(super.divide(rhs));
  }
  div(divisor: LongLike): Long2 {
    return this.divide(divisor);
  }
  modulo(divisor: LongLike): Long2 {
    const rhs = Long2.fromValue(divisor);
    return Long2.fromILong(super.modulo(rhs));
  }
  mod(divisor: LongLike): Long2 {
    return this.modulo(divisor);
  }
  not(): Long2 {
    return Long2.fromILong(super.not());
  }
  and(other: LongLike): Long2 {
    return Long2.fromILong(super.and(Long2.fromValue(other)));
  }
  or(other: LongLike): Long2 {
    return Long2.fromILong(super.or(Long2.fromValue(other)));
  }
  xor(other: LongLike): Long2 {
    return Long2.fromILong(super.xor(Long2.fromValue(other)));
  }
  shiftLeft(numBits: LongLike): Long2 {
    const rhs = Long2.fromValue(numBits);
    return Long2.fromILong(super.shiftLeft(rhs));
  }
  shiftRight(numBits: number | ILong): Long2 {
    const rhs = Long2.fromValue(numBits);
    return Long2.fromILong(super.shiftRight(rhs));
  }
  toNumber(): number {
    return super.toNumber();
  }
  toBigInt(): bigint {
    return BigInt(this.toString());
  }
  toString(radix?: number): string {
    return super.toString(radix);
  }
  /**
   * Creates a `Long` from a structure containing its low and high bits.
   */
  static fromILong(value: ILong) {
    return new this(value.low, value.high, value.unsigned);
  }
  static fromValue(value: LongLike): Long2 {
    switch (typeof value) {
      case 'bigint':
        return this.fromBigInt(value);
      case 'number':
        return this.fromNumber(value);
      case 'string':
        return this.fromString(value);
      default:
        return this.fromILong(value);
    }
  }
  static fromBigInt(value: bigint): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromValue(value.toString()));
    } catch (e) {
      throw new LongParseError(value);
    }
  }
  static fromNumber(value: number): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromNumber(value));
    } catch (e) {
      throw new LongParseError(value);
    }
  }
  static fromString(value: string, radix?: number): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromString(value, radix));
    } catch (e) {
      throw new LongParseError(value);
    }
  }
  static fromBits(lowBits: number, highBits: number, unsigned?: boolean): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromBits(lowBits, highBits, unsigned));
    } catch (e) {
      throw new LongParseError([lowBits, highBits, unsigned ?? false]);
    }
  }
  static fromInt(value: number): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromInt(value));
    } catch (e) {
      throw new LongParseError(value);
    }
  }
  static fromBytes(bytes: number[], unsigned?: boolean): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromBytes(bytes, unsigned));
    } catch (e) {
      throw new LongParseError([bytes, unsigned ?? false]);
    }
  }
  static fromBytesLE(bytes: number[], unsigned?: boolean): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromBytesLE(bytes, unsigned));
    } catch (e) {
      throw new LongParseError([bytes, unsigned ?? false]);
    }
  }
  static fromBytesBE(bytes: number[], unsigned?: boolean): Long2 {
    try {
      return this.fromILong(DataStaxTypes.Long.fromBytesBE(bytes, unsigned));
    } catch (e) {
      throw new LongParseError([bytes, unsigned ?? false]);
    }
  }
}

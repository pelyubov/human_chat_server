import { Long as Long2 } from './types';

export default class Snowflake {
  static readonly epoch = new Date('2024-01-01').getTime();
  static readonly workerIdBits = 6; // 64 workers
  static readonly sequenceBits = 16; // 65536 ids per ms

  private sequence = 0;

  /**
   * When not specified, layout is described as follows:
   ```
     1 unused bit
    41 dateTimeMs since epoch
     6 workerId
    16 sequence
   ```
   */
  constructor(private readonly workerId: number) {}

  next() {
    return this.fromTimestamp(Date.now());
  }

  fromTimestamp(timestamp: number) {
    if (timestamp < Snowflake.epoch) {
      throw new Error(`InvalidSystemClock: ${timestamp}`);
    }
    if (this.workerId < 0 || this.workerId >= 2 ** Snowflake.workerIdBits) {
      throw new Error(`InvalidWorkerId: ${this.workerId}`);
    }
    if (this.sequence >= 2 ** Snowflake.sequenceBits) {
      this.sequence = 0;
    } else {
      this.sequence++;
    }

    return Long2.fromNumber(timestamp - Snowflake.epoch)
      .shiftLeft(Snowflake.workerIdBits + Snowflake.sequenceBits)
      .or(Long2.fromNumber(this.workerId).shiftLeft(Snowflake.sequenceBits))
      .or(Long2.fromNumber(this.sequence));
  }

  static timestamp(id: Long2 | bigint | number) {
    return new Date(
      Long2.fromValue(id)
        .shiftRight(Snowflake.workerIdBits + Snowflake.sequenceBits)
        .add(Snowflake.epoch)
        .toNumber()
    );
  }
}

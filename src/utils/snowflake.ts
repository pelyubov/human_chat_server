export default class Snowflake {
  public static readonly epoch = new Date('2024-01-01').getTime();
  public static readonly workerIdBits = 6; // 64 workers
  public static readonly sequenceBits = 16; // 65536 ids per ms

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

    const diff = BigInt(timestamp - Snowflake.epoch);
    return (
      (diff << BigInt(Snowflake.workerIdBits + Snowflake.sequenceBits)) |
      BigInt(this.workerId << Snowflake.sequenceBits) |
      BigInt(this.sequence)
    );
  }

  static timestamp(id: bigint) {
    return Number(id >> BigInt(this.workerIdBits + this.sequenceBits)) + this.epoch;
  }
}

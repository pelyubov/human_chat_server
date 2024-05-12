export default class Snowflex {
  private readonly epoch: number;
  private readonly workerIdBits: number;
  private readonly dataCenterIdBits: number;
  private readonly sequenceBits: number;
  private readonly workerIdShift: number;
  private readonly dataCenterIdShift: number;
  private readonly sequenceMask: number;
  private readonly workerId: number;
  private readonly dataCenterId: number;
  private sequence: number;
  private lastTimestamp: number = -1;

  constructor(
    workerId: number,
    dataCenterId: number,
    epoch: number = 1634876162000,
    workerIdBits: number = 5,
    dataCenterIdBits: number = 5,
    sequenceBits: number = 12,
  ) {
    if (workerId >= 1 << workerIdBits) {
      throw new Error("worker Id can't be greater than %d or less than 0");
    }
    if (dataCenterId >= 1 << dataCenterIdBits) {
      throw new Error("dataCenter Id can't be greater than %d or less than 0");
    }
    this.workerId = workerId;
    this.dataCenterId = dataCenterId;
    this.sequence = 0;
    this.workerIdBits = workerIdBits;
    this.dataCenterIdBits = dataCenterIdBits;
    this.sequenceBits = sequenceBits;
    this.workerIdShift = this.sequenceBits;
    this.dataCenterIdShift = this.sequenceBits + this.workerIdBits;
    this.sequenceMask = -1 ^ (-1 << this.sequenceBits);
    this.epoch = epoch;
  }

  public getTimestamp(): number {
    return Date.now();
  }

  public nextId(): bigint {
    const timestamp = this.getTimestamp();
    if (this.lastTimestamp === -1) {
      this.lastTimestamp = timestamp;
    }
    if (timestamp < this.lastTimestamp) {
      throw new Error('Invalid SystemClock');
    }
    let diff = timestamp - this.lastTimestamp;
    if (diff >= 0 && diff < this.sequenceMask) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      this.lastTimestamp = timestamp;
    } else {
      this.sequence = 0;
      this.lastTimestamp = timestamp - (diff % (1 << this.sequenceBits));
    }
    return bigint(
      ((timestamp - this.epoch) << this.dataCenterIdShift) |
        (this.dataCenterId << this.workerIdShift) |
        (this.workerId << this.sequenceBits) |
        this.sequence,
    );
  }
}

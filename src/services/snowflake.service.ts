import Snowflake from '@Project.Utils/snowflake';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SnowflakeService {
  private snowflake: Snowflake;
  constructor() {
    this.snowflake = new Snowflake(parseInt(process.env.WORKER_ID));
  }

  public next() {
    return this.snowflake.next();
  }

  public fromTimestamp(timestamp: number) {
    return this.snowflake.fromTimestamp(timestamp);
  }
}

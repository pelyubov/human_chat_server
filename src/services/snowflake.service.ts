import Snowflake from '@Project.Utils/snowflake';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@Project.Services/config.service';

@Injectable()
export class SnowflakeService {
  private snowflake: Snowflake;
  constructor(config: ConfigService) {
    this.snowflake = new Snowflake(config.workerId);
  }

  public next() {
    return this.snowflake.next();
  }

  public fromTimestamp(timestamp: number) {
    return this.snowflake.fromTimestamp(timestamp);
  }
}

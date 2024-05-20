import { ConfigService } from '@Project.Services/config.service';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ConsoleLogger, Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [ConsoleLogger, ConfigService, SnowflakeService],
  exports: [ConsoleLogger, ConfigService, SnowflakeService]
})
export class CommonServicesModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('CommonServicesModule initialized', 'CommonServicesModule');
  }
}

import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger, Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [ConsoleLogger, ConfigService],
  exports: [ConsoleLogger, ConfigService]
})
export class CommonServicesModule {}

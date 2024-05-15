import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigService } from '@Project.Services/config.service';

import { AuthController } from './auth.controller';
import { CommonServicesModule } from '@Project.Src/common-services.module';
import { DbModule } from '@Project.Database/db.module';

@Module({
  imports: [CommonServicesModule, DbModule],
  providers: [],
  controllers: [AuthController]
})
export class AuthModule {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthModule initialized', 'AuthModule');
  }
}

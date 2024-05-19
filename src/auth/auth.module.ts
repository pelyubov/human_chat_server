import { ConsoleLogger, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { CommonServicesModule } from '@Project.Src/common-services.module';
import { DbModule } from '@Project.Database/db.module';
import { AuthDbService } from './auth-db.service';

@Module({
  imports: [CommonServicesModule, DbModule],
  providers: [AuthDbService],
  controllers: [AuthController]
})
export class AuthModule {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthModule initialized', 'AuthModule');
  }
}

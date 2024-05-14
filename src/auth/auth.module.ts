import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigService } from '@Project.Services/config.service';

import { AuthController } from './auth.controller';

@Module({
  imports: [],
  providers: [ConsoleLogger],
  controllers: [AuthController]
})
export class AuthModule {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthModule initialized', 'AuthModule');
  }
}

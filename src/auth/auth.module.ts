import { ConsoleLogger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [AuthController]
})
export class AuthModule {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthModule initialized', 'AuthModule');
  }
}

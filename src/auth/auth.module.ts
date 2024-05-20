import { ConsoleLogger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '../services/config.service';
import { hash } from 'bcrypt';
import { scrambleStrings } from '@Project.Utils/helpers';
import { AuthGuard } from './auth.guard';
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      async useFactory(config: ConfigService) {
        const salt = await hash(config.jwtSecret, 10);
        return {
          secret: scrambleStrings(config.jwtSecret, salt),
          signOptions: {
            expiresIn: '60s'
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard]
})
export class AuthModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('AuthModule initialized', 'AuthModule');
  }
}

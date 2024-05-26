import { CanActivate, ConsoleLogger, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly auth: AuthService
  ) {
    this.logger.log('AuthGuard initialized', 'AuthGuard');
  }
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers['authorization'].split(' ')[1];
      const user = this.auth.verify(token);
      request.userId = user;
    } catch (e) {
      return false;
    }
    return true;
  }
}

import { todo } from '@Project.Utils/macros';
import { ConsoleLogger, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  public login() {
    todo!('AuthController.login');
  }
}

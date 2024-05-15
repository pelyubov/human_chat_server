import { todo } from '@Project.Utils/helpers';
import { Body, ConsoleLogger, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private logger: ConsoleLogger) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  public login(@Body() body: LoginDto) {
    todo!('AuthController.login');
  }
}

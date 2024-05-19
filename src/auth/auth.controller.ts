import { ZodError } from 'zod';
import {
  Body,
  ConsoleLogger,
  Controller,
  Post,
  HttpCode,
  BadRequestException
} from '@nestjs/common';
import { LoginDto, ILoginDto } from '@Project.Dtos/login.dto';
import { formatError } from '@Project.Utils/helpers';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly auth: AuthService
  ) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  @HttpCode(200)
  public async login(@Body() body: ILoginDto) {
    try {
      return this.auth.login(await LoginDto.parseAsync(body));
    } catch (e) {
      if (!(e instanceof ZodError)) throw e;
      throw new BadRequestException({ error: formatError(e) });
    }
  }

  @Post('logout')
  @HttpCode(200)
  public async logout() {
    return { message: 'Logout successful' };
  }
}

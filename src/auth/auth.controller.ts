import { Request } from 'express';
import { ZodError } from 'zod';
import {
  Body,
  ConsoleLogger,
  Controller,
  Post,
  HttpCode,
  BadRequestException,
  Req
} from '@nestjs/common';
import { LoginDto, ILoginDto } from '@Project.Dtos/login.dto';
import { formatError } from '@Project.Utils/helpers';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly auth: AuthService
  ) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: ILoginDto) {
    try {
      return this.auth.login(await LoginDto.parseAsync(body));
    } catch (e) {
      if (e instanceof ZodError) throw new BadRequestException({ error: formatError(e) });
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: Request) {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new BadRequestException({ error: 'Token is required' });
    await this.auth.logout(token);
    return { message: 'Logout successful' };
  }
}

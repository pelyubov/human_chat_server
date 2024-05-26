import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  Body,
  ConsoleLogger,
  Controller,
  Post,
  Headers,
  HttpCode,
  BadRequestException,
  Req,
  Res
} from '@nestjs/common';
import { LoginDto, ILoginDto } from '@Project.Dtos/user/login.dto';
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
  async login(@Body() body: ILoginDto, @Res() response: Response) {
    try {
      const tokens = await this.auth.login(await LoginDto.parseAsync(body));
      response.cookie('refreshToken', tokens.refresh, {
        httpOnly: true,
        path: '/api/tokens'
      });
      return response.json({ accessToken: tokens.access });
    } catch (e) {
      if (e instanceof ZodError) throw new BadRequestException({ error: formatError(e) });
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Headers('authorization') token: string) {
    const { userId, actualToken } = await this.auth.verify(token);
    if (!token) throw new BadRequestException({ error: 'Token is required' });
    this.auth.logout(actualToken, userId.toBigInt());
    return { message: 'Logout successful' };
  }

  @Post('tokens')
  @HttpCode(200)
  async refreshToken(@Req() request: Request) {
    const token = request.cookies.refreshToken;
  }
}

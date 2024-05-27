import { Request, Response } from 'express';
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
import { todo } from '@Project.Utils/helpers';
import { AuthService } from './auth.service';
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';
import { controllerErrorHandler } from '@Project.Utils/error-handler';

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
      controllerErrorHandler(e, this.logger, 'AuthController');
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Headers('authorization') token: string) {
    try {
      const { userId, actualToken } = await this.auth.verify(token);
      if (!token) {
        throw new BadRequestException(ExceptionStrings.TOKEN_REQUIRED);
      }
      this.auth.logout(actualToken, userId.toBigInt());
      return { message: 'Logout successful' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'AuthController');
    }
  }

  @Post('tokens')
  @HttpCode(200)
  async refreshToken(@Req() request: Request) {
    todo!('Refresh token endpoint not implemented');
    const token = request.cookies.refreshToken;
  }
}

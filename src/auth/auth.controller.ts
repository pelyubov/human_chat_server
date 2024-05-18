import { compare } from 'bcrypt';
import {
  Body,
  ConsoleLogger,
  Controller,
  Post,
  Res,
  HttpStatus,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { LoginDto, ILoginDto } from './dtos/login.dto';
import { ZodError } from 'zod';
import { Response } from 'express';
import { AuthDbService } from './auth-db.service';

function formatError(e: ZodError) {
  return Object.fromEntries(e.errors.map((v) => [v.path.join('.'), v.message]));
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private logger: ConsoleLogger,
    private authDb: AuthDbService
  ) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  @HttpCode(200)
  public async login(@Body() body: ILoginDto, @Res() response: Response) {
    try {
      const result = await LoginDto.parseAsync(body);
      const user = await this.authDb.retrieveUser(result.email);
      console.log(user);
      if (!user) {
        throw new NotFoundException({ error: 'User does not exist' });
      }
      const isValid = await compare(result.password, user.credentials);
      if (!isValid) {
        throw new UnauthorizedException({ error: 'Invalid credentials' });
      }
      return response.status(200).json({ message: 'Success' });
    } catch (e) {
      if (!(e instanceof ZodError)) throw e;
      throw new BadRequestException({ error: formatError(e) });
    }
  }

  @Post('signup')
  public async signUp(@Body() body: ILoginDto, @Res() response: Response) {
    try {
      const result = await LoginDto.parseAsync(body);
      const user = await this.authDb.retrieveUser(result.email);
      if (user) {
        return response.status(400).json({ error: 'User already exists' });
      }
      await this.authDb.createUser(result.email, result.password);
      return response.status(200).json({ message: 'Success' });
    } catch (e) {
      if (!(e instanceof ZodError)) throw e;
      return response.status(HttpStatus.BAD_REQUEST).json({ error: formatError(e) });
    }
  }
}

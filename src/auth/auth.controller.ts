import { Body, ConsoleLogger, Controller, Post, Res } from '@nestjs/common';
import { LoginDto, ILoginDto } from './dtos/login.dto';
import { ZodError } from 'zod';
import { Response } from 'express';
import { AuthDbService } from './auth-db.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private logger: ConsoleLogger,
    private authDb: AuthDbService
  ) {
    this.logger.log('AuthController initialized', 'AuthController');
  }

  @Post('login')
  public async login(@Body() body: ILoginDto, @Res() response: Response) {
    try {
      const result = await LoginDto.parseAsync(body);
      const user = await this.authDb.retrieveUser(result.email);
      console.log(user);
      return response.status(200).json({ message: 'Success' });
    } catch (e) {
      if (!(e instanceof ZodError)) throw e;
      const error = Object.fromEntries(e.errors.map((v) => [v.path.join('.'), v.message]));
      return response.status(400).json({ error });
    }
  }
}

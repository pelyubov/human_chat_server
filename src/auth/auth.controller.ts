import { compare } from 'bcrypt';
import { ZodError } from 'zod';
import { Response } from 'express';
import {
  Body,
  ConsoleLogger,
  Controller,
  Post,
  Res,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { LoginDto, ILoginDto } from '@Project.Dtos/login.dto';
import { UserDbService } from '@Project.Src/managers/user-db.service';
import { formatError } from '@Project.Utils/helpers';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly authDb: UserDbService
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
}

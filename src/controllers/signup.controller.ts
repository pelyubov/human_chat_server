import { Response } from 'express';
import { ZodError } from 'zod';
import { Body, ConsoleLogger, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ISignUpDto, SignUpDto } from '@Project.Dtos/signup.dto';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { formatError } from '@Project.Utils/helpers';

@Controller('api')
export class SignUpController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly userManager: UserManagerService
  ) {
    this.logger.log('SignUpController initialized', 'SignUpController');
  }

  @Post('signup')
  async signUp(@Body() body: ISignUpDto, @Res() response: Response) {
    try {
      const result = await SignUpDto.parseAsync(body);
      if (await this.userManager.existsEmail(result.email)) {
        return response.status(400).json({ error: 'User already exists' });
      }
      if (await this.userManager.existsUsername(result.username)) {
        return response.status(400).json({ error: 'Username already exists' });
      }
      await this.userManager.createUser(result);
      return response.status(200).json({ message: 'Success' });
    } catch (e) {
      if (!(e instanceof ZodError)) throw e;
      return response.status(HttpStatus.BAD_REQUEST).json({ error: formatError(e) });
    }
  }
}

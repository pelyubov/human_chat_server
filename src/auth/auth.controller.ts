import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    try {
      return this.authService.login(signInDto.email, signInDto.password);
    } catch (error) {
      throw new HttpException(error.message, 409);
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(@Body() signUpDto: CreateUserDto) {
    try {
      await this.authService.register(signUpDto);
    } catch (error) {
      throw new HttpException(error.message, 409);
    }
  }

  @Public()
  @Post('check-email-exist')
  checkEmailExist(@Body() email: string): boolean {
    try {
      this.authService.checkEmailExist(email);
      return true;
    } catch (error) {
      if (error instanceof EmailNotValid) {
        throw new HttpException(error.message, 409);
      }
      if (error instanceof EmailNotFound) {
        throw new HttpException(error.message, 404);
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() email: string) {
    this.checkEmailExist(email);
    this.authService.forgotPassword(email);
  }

  @Public()
  @Post('check-pin-code')
  checkPinCode(@Body() dto: PinCodeDto) {
    if (!this.authService.checkPinCode(dto.pinCode)) {
      throw new HttpException('Pin code is incorrect', 400);
    }
    return HttpCode(200);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

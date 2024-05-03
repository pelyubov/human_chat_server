import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/user/dtos/user.dto';
import { LoginUser } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: UserDto) {
    return await this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    const user = await this.authService.login(data.email, data.password);
    if (!user) throw new BadRequestException('User does not exist or password is incorrect');
    const result = new LoginUser(
      user.id,
      user.name,
      user.email,
      user.password,
      user.status,
      user.isDeleted,
      user.friends,
      user.username,
      user.avatar,
    );
    return result;
  }
}

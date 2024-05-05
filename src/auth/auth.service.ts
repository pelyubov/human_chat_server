import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { UserService } from 'src/user/user.service';
import { HashingPassword } from './hassingPassword';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(email: string, password: string): Promise<any> {
    const user = await this.userService.login(email, password);
    if (!user || user.isDeleted) {
      throw new Error('User not found');
    }
    if (await HashingPassword.comparePassword(password, user.password)) {
      throw new Error('Password is incorrect');
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: CreateUserDto): Promise<any> {
    const exist = await this.userService.exist(signUpDto.email);
    if (exist) {
      throw new Error('User already exists');
    }
    signUpDto.password = await HashingPassword.hashPassword(signUpDto.password);
    const user = await this.userService.create(signUpDto);
    const payload = {
      id: user.id,
      email: user.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Mailer } from 'src/core/utils/mail/mailer';
import { pinGenerate } from 'src/core/utils/mail/pinGenerate';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { UserService } from 'src/user/user.service';
import { HashingPassword } from './hassingPassword';

@Injectable()
export class AuthService {
  private mailer: Mailer = new Mailer();
  private pinCode: string = '';
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}
  async login(email: string, password: string): Promise<any> {
    const user = await this.userService.login(email, password);
    if (!user || user.isDeleted) {
      throw new Error('User not found');
    }
    if (HashingPassword.comparePassword(password, user.password)) {
      throw new Error('Password is incorrect');
    }
    const payload = {
      id: user.id,
      email: user.email
    };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async register(signUpDto: CreateUserDto): Promise<any> {
    const exist = await this.userService.exist(signUpDto.email);
    if (exist) {
      throw new Error('User already exists');
    }
    signUpDto.password = HashingPassword.hashPassword(signUpDto.password);
    const user = await this.userService.create(signUpDto);
    const payload = {
      id: user.id,
      email: user.email
    };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async checkEmailExist(email: string) {
    this.mailer.send(email, 'check your email exist', '');
    const exist = await this.userService.exist(email);
    if (!exist) {
      throw new Error('User not found');
    } else {
      return true;
    }
  }

  forgotPassword(email: string) {
    this.pinCode = pinGenerate();
    this.mailer.send(email, 'Reset your password', `Reset password with pin code: ${this.pinCode}`);
  }

  checkPinCode(pinCode: string) {
    if (pinCode === this.pinCode) {
      return true;
    }
    return false;
  }
}

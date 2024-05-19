import {
  ConsoleLogger,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { ILoginDto } from '../dtos/login.dto';
import { UserManagerService } from '@Project.Managers/user-db.service';
import { UserId } from '@Project.Utils/types';

interface IToken {
  uid: UserId;
  blocked: boolean;
}

@Injectable()
export class AuthService {
  private readonly activeTokens = new Map<string, IToken>();
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly jwt: JwtService,
    private readonly userManager: UserManagerService
  ) {
    this.logger.log('AuthService initialized', 'AuthService');
  }
  async login(data: ILoginDto) {
    const { email, password } = data;
    const user = await this.userManager.retrieveUserAuth(email);
    console.log(user);
    if (!user) {
      throw new NotFoundException({ error: 'User does not exist' });
    }
    const isValid = await compare(password, user.credentials);
    if (!isValid) {
      throw new UnauthorizedException({ error: 'Invalid credentials' });
    }
    const jwtPayload = {
      sub: user.user_id.toString(),
      username: user.username
    };
    const token = this.jwt.sign(jwtPayload);
    this.activeTokens.set(token, { uid: user.user_id, blocked: false });
    return {
      token
    };
  }

  async verify(token: string) {
    // TODO: Some checks might be redundant here. Not sure what.
    if (!this.activeTokens.has(token)) {
      throw new UnauthorizedException('Invalid token');
    }
    if (!(await this.jwt.verifyAsync(token))) {
      throw new UnauthorizedException('Invalid token');
    }
    const tokenData = this.activeTokens.get(token)!;
    if (tokenData.blocked) {
      throw new UnauthorizedException('Token expired');
    }
    return tokenData.uid as UserId;
  }

  async logout(token: string) {
    this.activeTokens.delete(token);
    return { message: 'Logout successful' };
  }
}

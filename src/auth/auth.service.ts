import {
  ConsoleLogger,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { ILoginDto } from '../dtos/login.dto';
import { UserManagerService } from '@Project.Managers/user-manager.service';
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
    if (!(await this.jwt.verifyAsync(token))) {
      throw new UnauthorizedException('Invalid token');
    }
    if (!this.activeTokens.has(token)) {
      throw new UnauthorizedException('Token expired');
    }
    const tokenData = this.activeTokens.get(token)!;
    // TODO: This check might be redundant
    // The token is already "blocked" the moment it's not in the activeTokens map
    // if (tokenData.blocked) {
    //   throw new UnauthorizedException('Token expired: Blocked');
    // }
    return tokenData.uid as UserId;
  }

  logout(token: string) {
    this.activeTokens.delete(token);
  }
}

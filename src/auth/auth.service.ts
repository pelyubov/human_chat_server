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

@Injectable()
export class AuthService {
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
    return {
      token: await this.jwt.signAsync(jwtPayload, { expiresIn: '1h' })
    };
  }
}

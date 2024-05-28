import {
  ConsoleLogger,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { ILoginDto, LoginDto } from '@Project.Dtos/user/login.dto';
import { Long, Nullable } from '@Project.Utils/types';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import type { IUserAuth, IUserMeta } from '@Project.Database/schemas/user.schema';
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';

type AccessToken = string;
type RefreshToken = string;
type TokenMeta = {
  userId: string;
  username: string;
};

@Injectable()
export class AuthService {
  private readonly refreshTokens = new Map<RefreshToken, AccessToken>();
  private readonly activeTokens = new Set<AccessToken>();
  private readonly tokenMap = new Map<bigint, Set<RefreshToken | AccessToken>>();
  // private readonly blockedTokens = new Set<AcessToken>();
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly jwt: JwtService,
    private readonly cqlDb: CqlDbContext
  ) {
    this.logger.log('AuthService initialized', 'AuthService');
  }
  get model() {
    return this.cqlDb.model('Users') as ModelInstance<IUserMeta>;
  }
  async login(data: ILoginDto) {
    const { email, password } = data;
    const user = (await this.model.findOneAsync(
      { email },
      { select: ['user_id', 'username', 'credentials'], raw: true, allow_filtering: true }
    )) as Nullable<IUserAuth>;
    this.logger.debug(user, 'AuthService');
    if (!user) {
      throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
    }
    const isValid = await compare(password, user.credentials);
    if (!isValid) {
      throw new UnauthorizedException(ExceptionStrings.INVALID_CREDENTIALS);
    }
    return this.newTokenPair({
      userId: user.user_id.toString(),
      username: user.username
    });
  }

  async verify(token: string) {
    const actualToken = /^Bearer (.+)$/.exec(token)?.[1];
    if (!actualToken) {
      throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
    }
    if (!this.activeTokens.has(actualToken)) {
      throw new UnauthorizedException(ExceptionStrings.TOKEN_EXPIRED);
    }
    try {
      const tokenData = (await this.jwt.verifyAsync(actualToken)) as TokenMeta;
      if (!tokenData) {
        throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
      }
      // This check might be redundant
      // The token is already "blocked" the moment it's not in the activeTokens map
      // if (tokenData.blocked) {
      //   throw new UnauthorizedException(ExceptionStrings.TOKEN_BLOCKED);
      // }
      return {
        userId: Long.fromString(tokenData.userId),
        actualToken
      };
    } catch (e) {
      this.activeTokens.delete(actualToken);
      throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
    }
  }

  async refresh(refreshToken: string) {
    const actualRToken = /^Bearer (.+)$/.exec(refreshToken)?.[1];
    if (!actualRToken) {
      throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
    }
    try {
      if (!(await this.jwt.verifyAsync(actualRToken))) {
        throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
      }
    } catch (e) {
      throw new UnauthorizedException(ExceptionStrings.TOKEN_INVALID);
    }
    if (!this.refreshTokens.has(actualRToken)) {
      throw new UnauthorizedException(ExceptionStrings.TOKEN_EXPIRED);
    }
    const aToken = this.refreshTokens.get(actualRToken);
    if (aToken) {
      this.activeTokens.delete(aToken);
    }
    const tokenData = this.jwt.decode(actualRToken) as TokenMeta;
    this.refreshTokens.delete(actualRToken);
    const tokens = this.tokenMap.get(BigInt(tokenData.userId));
    tokens?.delete(actualRToken);
    tokens?.delete(aToken!);

    return this.newTokenPair(tokenData);
  }

  newTokenPair(data: TokenMeta) {
    const jwtPayload = {
      sub: Date.now().toString(2),
      userId: data.userId,
      username: data.username
    };
    const token = this.jwt.sign(jwtPayload);
    const refreshToken = this.jwt.sign(jwtPayload, {
      expiresIn: '7d'
    });
    this.activeTokens.add(token);
    this.refreshTokens.set(refreshToken, token);
    const userId = BigInt(data.userId);
    const tokens = this.tokenMap.get(userId);
    if (tokens) {
      tokens.add(token);
      tokens.add(refreshToken);
    } else {
      this.tokenMap.set(userId, new Set([token, refreshToken]));
    }
    return {
      access: token,
      refresh: refreshToken
    };
  }

  logout(token: AccessToken | RefreshToken, uid: bigint, allSessions = false) {
    this.activeTokens.delete(token);
    this.refreshTokens.delete(token);
    this.tokenMap.get(uid)?.delete(token);
    if (allSessions) {
      const { userId } = this.jwt.decode(token) as TokenMeta;
      const tokens = this.tokenMap.get(BigInt(userId));
      if (tokens) {
        for (const t of tokens) {
          this.refreshTokens.delete(t);
          this.activeTokens.delete(t);
        }
      }
    }
  }
}

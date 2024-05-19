import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CqlDbContext } from '@Project.Database/cql.db.service';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import type { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import type { IUser, IUserAuth } from '@Project.Database/cql/schemas/users.schema';
import { ISignUpDto } from '@Project.Dtos/signup.dto';
import { Nullable } from '@Project.Utils/types';

@Injectable()
export class UserManagerService {
  constructor(
    private readonly db: CqlDbContext,
    private readonly snowflake: SnowflakeService
  ) {}
  get model() {
    return this.db.model('Users') as ModelInstance<IUser>;
  }
  async retrieveUser(email: string) {
    return await this.model.findOneAsync({ email }, { raw: true });
  }
  async retrieveUserAuth(email: string) {
    return (await this.model.findOneAsync(
      { email },
      { select: ['user_id', 'username', 'credentials'], raw: true }
    )) as Nullable<IUserAuth>;
  }
  async createUser(data: ISignUpDto) {
    const { email, username, password, displayName } = data;
    const credentials = await hash(password, 10);
    const id = this.snowflake.next();
    const user = new this.model({
      user_id: id,
      email,
      display_name: displayName || username,
      username,
      credentials,
      bio: ''
    });
    return await user.saveAsync();
  }
  async existsEmail(email: string) {
    return !!(await this.model.findOneAsync({ email }, { select: ['email'] }));
  }
  async existsUsername(username: string) {
    return !!(await this.model.findOneAsync(
      { username },
      { select: ['username'], allow_filtering: true }
    ));
  }
}

import { Injectable } from '@nestjs/common';
import dummyDB from 'src/core/db/db_test';
import { UserDto } from 'src/user/dtos/user.dto';
import User from 'src/user/entities/user.enity';
import { IAuthService } from './auth.interface.service';

@Injectable()
export class AuthService implements IAuthService {
  dummyUserData: any;
  constructor() {
    this.dummyUserData = dummyDB.users;
  }
  register(userInfo: UserDto): Promise<boolean> {
    const user: User = {
      id: dummyDB.snowflake.nextId(),
      name: userInfo.name,
      email: userInfo.email,
      password: userInfo.password,
      username: userInfo.username,
      avatar: userInfo.avatar,
      status: userInfo.status,
      isDeleted: false,
      friends: [],
    };
    this.dummyUserData.push(user);
    return Promise.resolve(true);
  }
  login(email: string, password: string): Promise<User> {
    for (const user of this.dummyUserData) {
      if (user.email === email && user.password === password) {
        return Promise.resolve<User>(user);
      }
    }
    return Promise.resolve(null);
  }
}

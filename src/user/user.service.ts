import { Injectable } from '@nestjs/common';
import dummyDB from 'src/core/db/db_test';
import { UserDto } from './dtos/user.dto';
import User from './entities/user.enity';
import { IUserService } from './interfaces/user.interface.service';

@Injectable()
export class UserService implements IUserService {
  dummyUserData: any;
  constructor() {
    this.dummyUserData = dummyDB.users;
  }

  get(id: BigInt): Promise<User> {
    for (const user of this.dummyUserData) {
      if (user.id === id) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }
  update(id: BigInt, userInfo: UserDto): Promise<boolean> {
    for (const user of this.dummyUserData) {
      if (user.id === id) {
        user.name = userInfo.name;
        user.email = userInfo.email;
        user.password = userInfo.password;
        user.username = userInfo.username;
        user.avatar = userInfo.avatar;
        user.status = userInfo.status;
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
  delete(id: BigInt): Promise<boolean> {
    for (const user of this.dummyUserData) {
      if (user.id === id) {
        user.isDeleted = true;
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
  getFriends(id: BigInt): Promise<User[]> {
    for (const user of this.dummyUserData) {
      if (user.id === id) {
        let friends = [];
        for (const friendId of user.friends) {
          for (const friend of this.dummyUserData) {
            if (friend.id === friendId) {
              friends.push(friend);
            }
          }
        }
        return Promise.resolve(friends);
      }
    }
    return Promise.resolve(null);
  }
  getStrangers(id: BigInt): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

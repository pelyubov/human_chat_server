import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.interface.service';
import { User } from './entities/user';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UserService implements IUserService {
  create(id: BigInt, userInfo: UserDto): Promise<boolean> {
    // const user: User = {
    //     id: id
    //     name: userInfo.name

    // };
    throw new Error('Method not implemented.');
  }
  get(id: BigInt): Promise<User> {
    throw new Error('Method not implemented.');
  }
  update(id: BigInt, userInfo: UserDto): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: BigInt): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getFriends(id: BigInt): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  getStrangers(id: BigInt): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

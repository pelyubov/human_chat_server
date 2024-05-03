import { UserDto } from '../dtos/user.dto';
import User from '../entities/user.enity';

export interface IUserService {
  get(id: BigInt): Promise<User>;
  update(id: BigInt, userInfo: UserDto): Promise<boolean>;
  delete(id: BigInt): Promise<boolean>;
  getFriends(id: BigInt): Promise<User[]>;
  getStrangers(id: BigInt): Promise<User[]>;
}

export interface IRegisterService {
  register(userInfo: UserDto): Promise<boolean>;
}

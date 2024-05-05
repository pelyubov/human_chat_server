import { CreateUserDto } from '../dtos/createUser.dto';
import { User } from '../entities/user.enity';

export interface IUserService {
  get(id: BigInt): Promise<User>;
  update(id: BigInt, userInfo: CreateUserDto): Promise<boolean>;
  delete(id: BigInt): Promise<boolean>;
  getFriends(id: BigInt): Promise<User[]>;
  getStrangers(id: BigInt): Promise<User[]>;
}

export interface IRegisterService {
  register(userInfo: CreateUserDto): Promise<boolean>;
}

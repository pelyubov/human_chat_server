import { User } from '@Project.Root/entities/user.entity';
import { CreateUserDto } from './dtos/createUser.dto';

export interface IUserService {
  get(id: bigint): Promise<User>;
  update(id: bigint, userInfo: CreateUserDto): Promise<boolean>;
  delete(id: bigint): Promise<boolean>;
  getFriends(id: bigint): Promise<User[]>;
  getStrangers(id: bigint): Promise<User[]>;
}

export interface IRegisterService {
  register(userInfo: CreateUserDto): Promise<boolean>;
}

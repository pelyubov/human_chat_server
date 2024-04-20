import { UserDto } from '../dtos/user.dto';
import { User } from '../entities/user';

export interface IUserService {
  create(id: BigInt, userInfo: UserDto): Promise<boolean>;
  get(id: BigInt): Promise<User>;
  update(id: BigInt, userInfo: UserDto): Promise<boolean>;
  delete(id: BigInt): Promise<boolean>;
  getFriends(id: BigInt): Promise<User[]>;
  getStrangers(id: BigInt): Promise<User[]>;
}

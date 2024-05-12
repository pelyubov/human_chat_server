import { Injectable } from '@nestjs/common';
import UserDbContext from './db/user.db';
import { CreateUserDto } from './dtos/createUser.dto';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { User } from './entities/user.enity';

@Injectable()
export class UserService {
  constructor(private readonly userDbContext: UserDbContext) {}
  async create(user: CreateUserDto): Promise<any> {
    if (await this.exist(user.email)) {
      throw new Error('User already exists');
    }
    return await this.userDbContext.createUser(user);
  }

  async exist(email: string) {
    const user = await this.userDbContext.getUserByEmail(email);
    if (user) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async login(email: string, password: string) {
    const user = await this.userDbContext.login(email, password);
    return user;
  }

  async get(id: bigint): Promise<GetUserDto> {
    const userInfo = await this.userDbContext.getUser(id);
    if (!userInfo) {
      throw new Error('User not found');
    }
    const user = new GetUserDto(
      userInfo.id,
      userInfo.name,
      userInfo.email,
      userInfo.status,
      userInfo.isDeleted,
      userInfo.username,
      userInfo.avatar
    );
    return Promise.resolve(user);
  }
  async update(id: bigint, userInfo: UpdateUserDto): Promise<boolean> {
    const findUser = await this.userDbContext.getUser(id);
    if (!findUser) {
      throw new Error('User not found');
    }
    await this.userDbContext.updateUser(id, userInfo);
    return Promise.resolve(true);
  }
  async delete(id: bigint): Promise<boolean> {
    const findUser = await this.userDbContext.getUser(id);
    if (!findUser) {
      throw new Error('User not found');
    }
    await this.userDbContext.deleteUser(id);
    return Promise.resolve(true);
  }
  async getFriends(id: bigint): Promise<GetUserDto[]> {
    const findUser = await this.userDbContext.getUser(id);
    if (!findUser) {
      throw new Error('User not found');
    }
    const friends = await this.userDbContext.getFriends(id);
    return Promise.resolve(
      friends.map(
        (friend) =>
          new GetUserDto(
            friend.id,
            friend.name,
            friend.email,
            friend.status,
            friend.isDeleted,
            friend.username,
            friend.avatar
          )
      )
    );
  }
  async getStrangers(id: bigint): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}

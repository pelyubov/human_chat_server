import { Client } from 'cassandra-driver';
import { User } from '../entities/user.entity';
import { GraphTraversalSource } from 'testConnection/testGremlin';
import { Consumer, Producer } from 'kafkajs';

interface IUserDBContext {
  getUserByContainSubKeyword(): User[];
  getUser(): User;
  deleteUser(): void;
  updateUser(): void;
  createUser(): void;
  getFriends(): User[];
}

export default class UserDbContext implements IUserDBContext {
  private static _instance: UserDbContext;

  private tableName = 'users';
  constructor(
    private g?: GraphTraversalSource,
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer
  ) {
    if (UserDbContext._instance) {
      return UserDbContext._instance;
    }

    UserDbContext._instance = this;
  }
  getUserByContainSubKeyword(): User[] {
    throw new Error('Method not implemented.');
  }
  getUser(): User {
    throw new Error('Method not implemented.');
  }
  deleteUser(): void {
    throw new Error('Method not implemented.');
  }
  updateUser(): void {
    throw new Error('Method not implemented.');
  }
  createUser(): void {
    throw new Error('Method not implemented.');
  }
  getFriends(): User[] {
    throw new Error('Method not implemented.');
  }
}

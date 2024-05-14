import { Module } from '@nestjs/common';
import UserDbContext from './user.db';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserDbContext],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}

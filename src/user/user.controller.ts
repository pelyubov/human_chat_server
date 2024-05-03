import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import User from './entities/user.enity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get/:id')
  async getUser(@Param('id') id: BigInt): Promise<User> {
    const user = this.userService.get(id);
    return user;
  }

  // @Post('create')
  // async createUser(@Body() user: UserDto): Promise<boolean> {
  //   return this.userService.create(BigInt(1), user);
  // }

  @Put('update/:id')
  async updateUser(@Param('id') id: BigInt, @Body() user: UserDto): Promise<boolean> {
    return this.userService.update(id, user);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: BigInt): Promise<boolean> {
    return this.userService.delete(id);
  }
}

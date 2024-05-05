import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dtos/createUser.dto';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get/:id')
  async getUser(@Param('id') id: BigInt): Promise<GetUserDto> {
    return await this.userService.get(id);
  }

  @Post('create')
  async createUser(@Body() user: CreateUserDto): Promise<boolean> {
    this.userService.create(user);
    return true;
  }

  @Put('update/:id')
  async updateUser(@Param('id') id: BigInt, @Body() user: UpdateUserDto): Promise<boolean> {
    return this.userService.update(id, user);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: BigInt): Promise<boolean> {
    return this.userService.delete(id);
  }
}

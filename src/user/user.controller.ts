import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/createUser.dto';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get/:id')
  async getUser(@Param('id') id: bigint): Promise<GetUserDto> {
    try {
      return await this.userService.get(id);
    } catch (error) {
      throw new HttpException(error.message, 404);
    }
  }

  @HttpCode(200)
  @Post('create')
  async createUser(@Body() user: CreateUserDto): Promise<void> {
    try {
      this.userService.create(user);
    } catch (error) {
      throw new HttpException(error.message, 409);
    }
  }

  @Put('update/:id')
  async updateUser(@Param('id') id: bigint, @Body() user: UpdateUserDto): Promise<boolean> {
    try {
      return this.userService.update(id, user);
    } catch (error) {
      throw new HttpException(error.message, 404);
    }
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: bigint): Promise<boolean> {
    try {
      return this.userService.delete(id);
    } catch (error) {
      throw new HttpException(error.message, 404);
    }
  }
}

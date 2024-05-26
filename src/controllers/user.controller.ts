import {
  BadRequestException,
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put
} from '@nestjs/common';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { Long } from '@Project.Utils/types';
import { AuthService } from '../auth/auth.service';
import { ISignUpDto, SignUpDto } from '@Project.Dtos/user/signup.dto';
import { ZodError } from 'zod';
import { formatError } from '@Project.Utils/helpers';
import { IUpdateUserDto, UpdateUserDto } from '@Project.Dtos/user/update-user.dto';
import { WsGateway } from '../ws/ws.gateway';

// @UseGuards(AuthGuard)
@Controller('api')
export class UserController {
  userManager: any;
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserManagerService,
    private readonly channels: ChannelManagerService,
    private readonly ws: WsGateway,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('UserController initialized', 'UserController');
  }

  @Post('signup')
  async signUp(@Body() body: ISignUpDto) {
    try {
      const result = await SignUpDto.parseAsync(body);
      if (await this.users.existsEmail(result.email)) {
        throw new BadRequestException({ error: 'Email already exists.' });
      }
      if (await this.users.existsUsername(result.username)) {
        throw new BadRequestException({ error: 'Username already exists.' });
      }
      await this.users.create(result);
      return { message: 'Success' };
    } catch (e) {
      if (!(e instanceof ZodError)) throw new BadRequestException({ error: e });
      throw new BadRequestException({ error: formatError(e) });
    }
  }

  @Get('@me')
  async selfInfo(@Headers('authorization') token: string) {
    const { userId } = await this.auth.verify(token);
    const user = await this.users.get(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch('@me')
  async updateUser(@Headers('authorization') token: string, @Body() body: IUpdateUserDto) {
    try {
      const { userId, actualToken } = await this.auth.verify(token);
      const { email, password, oldPassword, bio, displayName, username } =
        await UpdateUserDto.parseAsync(body);
      const data = await this.users.update(userId, {
        email,
        password,
        oldPassword,
        bio,
        displayName,
        username
      });
      if (password && oldPassword) {
        this.auth.logout(actualToken, userId.toBigInt(), true);
        return {
          message: 'Password has been updated. Please login again.'
        };
      }
      return {
        message: 'User updated successfully.',
        data: {
          userId: data.user_id,
          username: data.username,
          email: data.email,
          displayName: data.display_name,
          bio: data.bio
        }
      };
    } catch (e) {
      if (e instanceof ZodError) throw new BadRequestException({ error: e });
      if (e instanceof BadRequestException) throw new BadRequestException({ error: e.message });
      throw e;
    }
  }

  @Delete('@me')
  async deleteUser(@Headers('authorization') token: string) {
    const { userId } = await this.auth.verify(token);
    await this.users.delete(userId);
    return { message: 'User deleted successfully.' };
  }

  @Delete('@me/requests/:id/reject')
  async deleteRelation(@Headers('authorization') token: string, @Param('id') id: string) {
    const { userId: senderId } = await this.auth.verify(token);
    await this.users.unfriend(senderId, Long.fromString(id));
    // TODO: thinking about if you being reject, you want to know it?
    // await this.manager.rejectFriendRequest(id);
    //   verify if the edge exists id -> user with { status = PENDING }
    //   delete the edge between the two users
    return { message: 'Friend request rejected successfully.' };
  }

  @Put('@me/requests/:id/accept')
  async acceptFriendRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    const responderId = (await this.auth.verify(token)).userId;
    const requesterId = (await this.users.get(Long.fromString(id)))?.user_id;
    if (!requesterId) throw new NotFoundException('User not found');
    try {
      await this.users.acceptRequest(responderId, requesterId);
      await this.channels.create(`DM`, [requesterId, responderId]);
      return { message: 'Friend request accepted successfully' };
    } catch (e) {
      if (e instanceof BadRequestException) throw new BadRequestException({ error: e.message });
      throw e;
    }
  }

  @Post('@me/requests/new')
  async sendFriendRequest(
    @Headers('authorization') token: string,
    @Body('username') username: string
  ) {
    const { userId: senderId } = await this.auth.verify(token);
    const receiverId = await this.users.retrieveUserId(username);
    if (!receiverId) throw new NotFoundException('User not found');
    try {
      await this.users.sendRequest(senderId, receiverId);
    } catch (e) {
      if (e instanceof BadRequestException) throw new BadRequestException({ error: e.message });
      throw e;
    }
    return { message: 'Friend request sent successfully.' };
  }

  @Get('@me/requests/outgoing')
  async getFriendRequests(@Headers('authorization') token: string) {
    const { userId: requester } = await this.auth.verify(token);
    // const requests = await this.manager.getFriendRequests();
    //   return shape: { requests: IUserMeta[] }
    const friendRequestIdList = await this.users.getOutgoingRequests(requester);
    const results = await Promise.all(
      friendRequestIdList.map(async (id) => {
        const user = await this.users.get(id);
        if (!user) throw new InternalServerErrorException('User not found');
        return user;
      })
    );
    return { requests: results };
  }

  @Get('@me/requests/incoming')
  async getIncomingRequestsList(@Headers('authorization') token: string) {
    const { userId: requester } = await this.auth.verify(token);
    const friendRequestIdList = await this.users.getOutgoingRequests(requester);
    const results = await Promise.all(
      friendRequestIdList.map(async (id) => {
        const user = await this.users.get(id);
        if (!user) throw new InternalServerErrorException('User not found');
        return user;
      })
    );
    return { requests: results };
  }

  @Delete('@me/requests/:id')
  async cancelFriendRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    const { userId: senderId } = await this.auth.verify(token);
    await this.users.cancelRequest(senderId, Long.fromString(id));
    return { message: 'Friend request cancelled successfully.' };
  }
}

import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post
} from '@nestjs/common';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { Long } from '@Project.Utils/types';
import { AuthService } from '../auth/auth.service';

// @UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserManagerService,
    private readonly channels: ChannelManagerService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('UserController initialized', 'UserController');
  }

  @Post('@me/send-request')
  async sendRequest(@Headers('authorization') token: string, @Body() username: string) {
    await this.auth.verify(token);
    const user = await this.users.retrieveUserId(username);
    if (!user) throw new NotFoundException('User not found');
    // await this.manager.sendFriendRequest(user);
    //   verify if user is not already a friend
    //   verify if user is not already blocked
    //   verify if user is not already pending
    //   form an edge between the two users
    //   return shape: { message: "Friend request sent successfully" }
    // return user;
  }

  @Get('@me/requests')
  async getRequests(@Headers('authorization') token: string) {
    await this.auth.verify(token);
    // const requests = await this.manager.getFriendRequests();
    //   return shape: { requests: IUserMeta[] }
  }

  @Post('@me/requests/:id/accept')
  async acceptRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    await this.auth.verify(token);
    const user = await this.users.get(Long.fromString(id));
    if (!user) throw new NotFoundException('User not found');
    // await this.manager.acceptFriendRequest(id);
    //   verify if the edge exists with { status = PENDING }
    //   update the edge between the two users -> { status = FRIEND }
    //   create a new channel between the two users
    //   return shape: { message: "Friend request accepted successfully" }
  }

  @Delete('@me/requests/:id/reject')
  async deleteRequest(@Headers('authorization') token: string) {
    await this.auth.verify(token);
    // await this.manager.rejectFriendRequest(id);
    //   verify if the edge exists with { status = PENDING }
    //   delete the edge between the two users
    //   return shape: { message: "Friend request rejected successfully" }
  }
}

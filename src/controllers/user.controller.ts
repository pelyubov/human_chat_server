import {
  BadRequestException,
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Headers,
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
import { IUpdateUserDto, UpdateUserDto } from '@Project.Dtos/user/update-user.dto';
import { WsGateway } from '../ws/ws.gateway';
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';
import { controllerErrorHandler } from '@Project.Utils/error-handler';

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

  @Get('users/:userId')
  async userInfo(@Headers('authorization') token: string, @Param('userId') userId: string) {
    try {
      await this.auth.verify(token);
      const user = await this.users.model.findOneAsync(
        {
          user_id: Long.fromString(userId)
        },
        {
          select: ['display_name', 'username', 'bio'],
          raw: true
        }
      );
      if (!user) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
      }
      return {
        data: {
          displayName: user.display_name,
          username: user.username,
          bio: user.bio
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Post('check-email')
  async checkEmail(@Body() body: { email: string }) {
    try {
      return { data: { exists: await this.users.existsEmail(body.email) } };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Post('signup')
  async signUp(@Body() body: ISignUpDto) {
    try {
      const result = await SignUpDto.parseAsync(body);
      if (await this.users.existsEmail(result.email)) {
        throw new BadRequestException(ExceptionStrings.EMAIL_EXISTS);
      }
      if (await this.users.existsUsername(result.username)) {
        throw new BadRequestException(ExceptionStrings.USERNAME_EXISTS);
      }
      await this.users.create(result);
      return { message: 'Success' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Get('@me')
  async selfInfo(@Headers('authorization') token: string) {
    try {
      const { userId } = await this.auth.verify(token);
      const user = await this.users.get(userId);
      if (!user) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
      }
      return {
        data: {
          user
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
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
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Delete('@me')
  async deleteUser(@Headers('authorization') token: string) {
    try {
      const { userId } = await this.auth.verify(token);
      await this.users.delete(userId);
      return { message: 'User deleted successfully.' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Post('@me/requests/new')
  async sendRequest(@Headers('authorization') token: string, @Body('username') username: string) {
    try {
      const { userId: senderId } = await this.auth.verify(token);
      const receiverId = await this.users.retrieveUserId(username);
      if (!receiverId) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
      }
      await this.users.sendRequest(senderId, receiverId);
      return { message: 'Friend request sent successfully.' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Put('@me/requests/:id/accept')
  async acceptRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    try {
      const responderId = (await this.auth.verify(token)).userId;
      const requesterId = (await this.users.get(Long.fromString(id)))?.user_id;
      if (!requesterId) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
      }
      await this.users.acceptRequest(responderId, requesterId);
      await this.channels.create(`DM`, [requesterId, responderId]);
      return { message: 'Friend request accepted successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Delete('@me/requests/:id')
  async cancelRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    try {
      const { userId: senderId } = await this.auth.verify(token);
      await this.users.cancelRequest(senderId, Long.fromString(id));
      return { message: 'Friend request cancelled successfully.' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Delete('@me/requests/:id/reject')
  async rejectRequest(@Headers('authorization') token: string, @Param('id') id: string) {
    try {
      const { userId: senderId } = await this.auth.verify(token);
      await this.users.rejectRequest(senderId, Long.fromString(id));
      return { message: 'Friend request rejected successfully.' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Get('@me/requests/outgoing')
  async getOutgoingRequests(@Headers('authorization') token: string) {
    try {
      const { userId: requester } = await this.auth.verify(token);
      const requests = await this.users.getIncomingRequests(requester);
      return {
        data: {
          requests
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Get('@me/requests/incoming')
  async getIncomingRequests(@Headers('authorization') token: string) {
    try {
      const { userId: requester } = await this.auth.verify(token);
      const requests = await this.users.getOutgoingRequests(requester);
      return {
        data: {
          requests
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }

  @Delete('@me/friends/:id')
  async unfriend(@Headers('authorization') token: string, @Param('id') id: string) {
    try {
      const { userId: removerId } = await this.auth.verify(token);
      await this.users.unfriend(removerId, Long.fromString(id));
      return { message: 'Friend removed successfully.' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'UserController');
    }
  }
}

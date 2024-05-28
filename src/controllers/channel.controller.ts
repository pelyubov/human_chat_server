import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
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
  Post
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { MessageManagerService } from '@Project.Managers/message-manager.service';
import { Long } from '@Project.Utils/types';
import { ChanCreationDto, IChanCreationDto } from '@Project.Dtos/channel/create-channel.dto';
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';
import { controllerErrorHandler } from '@Project.Utils/error-handler';

@Controller('api')
export class ChannelController {
  constructor(
    private readonly channels: ChannelManagerService,
    private readonly users: UserManagerService,
    private readonly messages: MessageManagerService,
    private readonly auth: AuthService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('ChatController initialized', 'ChatController');
  }

  @Post('channels/create')
  async createChannel(@Headers('authorization') token: string, @Body() data: IChanCreationDto) {
    try {
      const { userId } = await this.auth.verify(token);
      const { name: channelName, users: channelUsers } = await ChanCreationDto.parseAsync(data);

      const members = new Set(channelUsers);
      members.delete(userId.toString());
      const channel = await this.channels.create(
        channelName,
        [...channelUsers].map((u) => Long.fromString(u)),
        userId
      );

      return {
        message: 'Channel created successfully',
        data: {
          channelId: channel.chan_id
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  // It's quite possible that channel metadata is emitted via the WebSocket connection.
  @Get('channels')
  async getChannels(@Headers('authorization') token: string) {
    try {
      const { userId } = await this.auth.verify(token);
      const channelsId = await this.users.fetchChannelIds(userId);
      const channelMetas = await Promise.all(
        channelsId.map(async (channelId) => {
          const channel = await this.channels.get(channelId);
          return {
            id: channelId.toString(),
            name: channel?.name
          };
        })
      );
      return {
        data: {
          channels: channelMetas
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Get('channels/:channelId')
  async channelInfo(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const user = await this.users.get(userId);
      if (!user) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_USER);
      }
      const chanId = Long.fromBigInt(channelId);
      const channel = await this.channels.get(chanId);
      if (!channel) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_CHANNEL);
      }
      if (!channel.users.includes(userId.toBigInt())) {
        throw new BadRequestException(ExceptionStrings.NOT_MEMBER);
      }
      return {
        data: {
          id: channelId.toString(),
          name: channel.name,
          users: channel.users.map((u) => u.toString())
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Patch('channels/:channelId')
  async editChannel(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body() data: Omit<IChanCreationDto, 'users'>
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const isOwner = await this.channels.isOwner(userId, Long.fromBigInt(channelId));
      if (!isOwner) {
        throw new BadRequestException(ExceptionStrings.NOT_OWNER);
      }
      const updated = await this.channels.update(
        userId,
        await ChanCreationDto.pick({ name: true }).parseAsync(data)
      );
      return {
        message: 'Successfully edited channel.',
        data: {
          channelId: channelId.toString(),
          name: updated.name
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Post('channels/:channelId/invite')
  async createInvite(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body() data: { lifetime?: number }
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const isOwner = await this.channels.isOwner(userId, Long.fromBigInt(channelId));
      if (!isOwner) {
        throw new BadRequestException(ExceptionStrings.NOT_OWNER);
      }
      const inviteCode = await this.channels.createInvite(
        userId,
        Long.fromBigInt(channelId),
        data.lifetime
      );
      return {
        message: 'Invite created successfully',
        data: {
          inviteCode
        }
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Post('join/:inviteCode')
  async joinChannel(
    @Headers('authorization') token: string,
    @Param('inviteCode') inviteCode: string
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      await this.channels.useInvite(userId, inviteCode);
      return { message: 'Channel joined successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Delete('channels/:channelId/leave')
  async leaveChannel(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      await this.channels.leave(userId, Long.fromBigInt(channelId));
      return { message: 'Channel left successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Delete('channels/:channelId')
  async deleteChannel(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const chanId = Long.fromBigInt(channelId);
      const isOwner = await this.channels.isOwner(userId, chanId);
      if (!isOwner) {
        throw new BadRequestException(ExceptionStrings.NOT_OWNER);
      }
      await this.channels.delete(chanId);
      return { message: 'Channel deleted successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Post(':channelId/members')
  async addMembers(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body('users') users: IChanCreationDto['users']
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const chanId = Long.fromBigInt(channelId);
      const isOwner = await this.channels.isOwner(userId, chanId);
      if (!isOwner) {
        throw new BadRequestException(ExceptionStrings.NOT_OWNER);
      }
      const { users: members } = await ChanCreationDto.pick({ users: true }).parseAsync({ users });
      await this.channels.addMembers(
        chanId,
        members.map((u) => Long.fromString(u))
      );
      return { message: 'Members added successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Delete(':channelId/members')
  async removeMembers(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body('users') users: IChanCreationDto['users']
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const chanId = Long.fromBigInt(channelId);
      const isOwner = await this.channels.isOwner(userId, chanId);
      if (!isOwner) {
        throw new BadRequestException(ExceptionStrings.NOT_OWNER);
      }
      const { users: members } = await ChanCreationDto.pick({ users: true }).parseAsync({ users });
      await this.channels.removeMembers(
        chanId,
        members.map((u) => Long.fromString(u))
      );
      return { message: 'Members removed successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }
}

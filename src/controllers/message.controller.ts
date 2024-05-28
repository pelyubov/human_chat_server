import { IIncomingMessageDto, IncomingMessageDto } from '@Project.Dtos/message.dto';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { MessageManagerService } from '@Project.Managers/message-manager.service';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { Long } from '@Project.Utils/types';
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
import { ExceptionStrings } from '@Project.Utils/errors/ExceptionStrings';
import { controllerErrorHandler } from '@Project.Utils/error-handler';

@Controller('api/channels')
export class MessageController {
  constructor(
    private readonly channels: ChannelManagerService,
    private readonly users: UserManagerService,
    private readonly messages: MessageManagerService,
    private readonly auth: AuthService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('MessageController initialized', 'MessageController');
  }

  @Get(':channelId/messages')
  async fetchMessages(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: string,
    @Body()
    data: {
      lastOldestGetMessageId: string;
      limit: number;
    }
  ) {
    try {
      await this.auth.verify(token);
      const { lastOldestGetMessageId, limit } = data;
      const messages = await this.messages.getMessages(
        Long.fromString(channelId),
        limit,
        lastOldestGetMessageId ? Long.fromString(lastOldestGetMessageId) : null
      );
      return { data: { messages } };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'ChannelController');
    }
  }

  @Post(':channelId/messages')
  async sendMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body() data: IIncomingMessageDto
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
      const { content, replyTo } = await IncomingMessageDto.parseAsync(data);
      const message = await this.messages.create(
        chanId,
        userId,
        content,
        replyTo ? Long.fromString(replyTo) : null
      );
      this.channels.sendMessage(chanId, userId, message);
      return { message: 'Message sent successfully' };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'MessageController');
    }
  }

  @Patch(':channelId/messages/:messageId')
  async editMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Param('messageId') messageId: bigint,
    @Body() data: IIncomingMessageDto
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const { content } = await IncomingMessageDto.parseAsync(data);
      const channel = await this.channels.get(Long.fromBigInt(channelId));
      if (!channel) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_CHANNEL);
      }
      if (!channel.users.includes(userId.toBigInt())) {
        throw new BadRequestException(ExceptionStrings.NOT_MEMBER);
      }
      return {
        data: await this.messages.edit(userId, Long.fromBigInt(messageId), { content })
      };
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'MessageController');
    }
  }

  @Delete(':channelId/messages/:messageId')
  async deleteMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Param('messageId') messageId: bigint
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      const channel = await this.channels.get(Long.fromBigInt(channelId));
      if (!channel) {
        throw new NotFoundException(ExceptionStrings.UNKNOWN_CHANNEL);
      }
      if (!channel.users.includes(userId.toBigInt())) {
        throw new BadRequestException(ExceptionStrings.NOT_MEMBER);
      }
      await this.messages.delete(userId, Long.fromBigInt(messageId));
    } catch (e) {
      controllerErrorHandler(e, this.logger, 'MessageController');
    }
  }
}

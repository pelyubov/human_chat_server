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
  Headers,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller('api/channels')
export class MessageController {
  constructor(
    private readonly channels: ChannelManagerService,
    private readonly users: UserManagerService,
    private readonly messages: MessageManagerService,
    private readonly auth: AuthService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('ChatController initialized', 'ChatController');
  }

  @Post(':channelId/messages')
  async sendMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Body() data: IIncomingMessageDto
  ) {
    const { userId } = await this.auth.verify(token);
    const user = await this.users.get(userId);
    if (!user) throw new BadRequestException('User does not exist.');
    const chanId = Long.fromBigInt(channelId);
    const channel = await this.channels.get(chanId);
    if (!channel) throw new BadRequestException('Channel does not exist.');
    if (!channel.users.includes(userId.toBigInt()))
      throw new BadRequestException('User is not in channel.');
    const { content, replyTo } = await IncomingMessageDto.parseAsync(data);
    const message = await this.messages.create(
      chanId,
      userId,
      content,
      replyTo ? Long.fromString(replyTo) : null
    );
    this.channels.sendMessage(chanId, userId, message);
    return { message: 'Message sent successfully' };
  }

  @Patch(':channelId/messages/:messageId')
  async editMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Param('messageId') messageId: bigint,
    @Body() data: IIncomingMessageDto
  ) {
    const { userId } = await this.auth.verify(token);
    const { content } = await IncomingMessageDto.parseAsync(data);
    const channel = await this.channels.get(Long.fromBigInt(channelId));
    if (!channel) throw new BadRequestException('Channel does not exist.');
    if (!channel.users.includes(userId.toBigInt()))
      throw new BadRequestException('User is not in channel.');
    return await this.messages.edit(userId, Long.fromBigInt(messageId), { content });
  }

  @Delete(':channelId/messages/:messageId')
  async deleteMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: bigint,
    @Param('messageId') messageId: bigint
  ) {
    const { userId } = await this.auth.verify(token);
    const channel = await this.channels.get(Long.fromBigInt(channelId));
    if (!channel) throw new BadRequestException('Channel does not exist.');
    if (!channel.users.includes(userId.toBigInt()))
      throw new BadRequestException('User is not in channel.');
    await this.messages.delete(userId, Long.fromBigInt(messageId));
  }
}

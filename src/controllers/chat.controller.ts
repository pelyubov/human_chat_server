import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Param,
  Post
} from '@nestjs/common';
import { WsGateway } from '../ws/ws.gateway';
import { IIncomingMessageDto, IncomingMessageDto } from '@Project.Dtos/message.dto';
import { AuthService } from '../auth/auth.service';
import { UserManagerService } from '@Project.Managers/user-manager.service';

@Controller('api')
export class ChannelController {
  constructor(
    private readonly channels: ChannelManagerService,
    private readonly users: UserManagerService,
    private readonly auth: AuthService,
    private readonly ws: WsGateway,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('ChatController initialized', 'ChatController');
  }

  @Post('channels/create')
  async createChannel(@Headers('authorization') token: string) {
    const userId = await this.auth.verify(token);
    // const channel = await this.channels.create(userId);
    // return shape: { message: "Channel created successfully", channelId }
  }

  // It's quite possible that channel metadata is emitted via the WebSocket connection.
  //   @Get('channels')
  //   async getChannels(@Headers('authorization') token: string) {
  //     const userId = await this.auth.verify(token);
  //
  //   }

  @Post('channels/:channelId/messages')
  async sendMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: string,
    @Body() data: IIncomingMessageDto
  ) {
    const userId = await this.auth.verify(token);
    const user = await this.users.get(userId);
    const message = await IncomingMessageDto.parseAsync(data);
    // this.ws.sendMessage(channelId, user, message);
    //    verify if user is in channel
    //    verify if user is not blocked
    //    create message
    //    broadcast to all users in channel
    //    return shape: { message: "Message sent successfully", messageId }
  }

  @Delete('channels/:channelId/messages/:messageId')
  async deleteMessage(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: string,
    @Param('messageId') messageId: string
  ) {
    const userId = await this.auth.verify(token);
    // await this.channels.deleteMessage(channelId, messageId, userId);
    //    verify if user is owner of message
    //    delete message
    //    broadcast to all users in channel
  }

  @Delete('channels/:channelId')
  async deleteChannel(
    @Headers('authorization') token: string,
    @Param('channelId') channelId: string
  ) {
    // const userId = await this.auth.verify(token);
    // await this.channels.delete(userId, channelId);
    //    verify if user is owner of channel
    //    force leave all users
    //    delete channel
  }
}

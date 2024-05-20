import { ConsoleLogger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { WebSocket, Server as WsServer } from 'ws';
import { IncomingMessage } from 'http';
import { AuthService } from '../auth/auth.service';
import { ChannelId, UserId } from '@Project.Utils/types';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { IUserMeta } from '@Project.Database/schemas/user.schema';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { IMessage } from '@Project.Database/schemas/message.schema';
import { UUID, randomUUID } from 'crypto';
import { IIncomingMessageDto } from '@Project.Dtos/message.dto';

interface IUserSession extends WebSocket {
  clientId: UUID;
  userId: UserId;
}

// @UseGuards(AuthGuard)
@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: WsServer;

  private readonly clients = new Map<UserId, Map<UUID, WebSocket>>();
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly users: UserManagerService,
    private readonly channels: ChannelManagerService,
    private readonly auth: AuthService
  ) {
    this.logger.log('WsGateway initialized', 'WsGateway');
  }

  // TODO: Add channels
  // TODO: Add session IDs for users with multiple connections
  async handleConnection(client: IUserSession, message: IncomingMessage) {
    const token = message.headers.authorization;
    if (!token) {
      this.logger.error(`${message.headers.origin} has no token`, 'WsGateway.Unauthorized');
      client.close();
      return;
    }
    try {
      const userId = await this.auth.verify(token);
      const socketId = randomUUID();
      client.userId = userId;
      client.clientId = socketId;

      if (this.clients.has(userId)) {
        this.clients.get(userId)!.set(socketId, client);
      } else {
        this.clients.set(userId, new Map([[socketId, client]]));
      }

      this.logger.log(`Client(${socketId}) [User(${userId})] has connected.`, 'WsGateway');
    } catch (e) {
      this.logger.error(`${e.message}, token: ${token}`, 'WsGateway.Unauthorized');
      client.close();
    }
  }

  async handleDisconnect(client: IUserSession) {
    const { userId, clientId } = client;
    this.clients.get(userId)!.delete(clientId);
    this.logger.log(`Client(${clientId}) [User(${userId})] has disconnected.`, 'WsGateway');
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string, @ConnectedSocket() client: WebSocket & IUserMeta) {
    const userId = client.user_id.toNumber();
    this.logger.log(
      `User ${client.display_name} (${client.username}, ${userId}): "${message}"`,
      'WsGateway'
    );
    const data = {
      event: 'message',
      data: {
        userId,
        author: `${client.display_name} (@${client.username})`,
        message
      }
    };
    this.server.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) {
        // c.send(JSON.stringify(data));
        c.send(`${data.data.author}: ${data.data.message}`);
      }
    });
  }

  @SubscribeMessage('getChannels')
  getChannels(@ConnectedSocket() client: WebSocket & IUserMeta) {
    // const userId = client.user_id.toNumber();
    // const channels = this.channels.getChannelsForUser(userId);
    // const data = {
    //   event: 'getChannels',
    //   data: channels
    // };
    client.send(JSON.stringify({}));
  }

  sendMessage(channelId: ChannelId, user: IUserSession, message: IIncomingMessageDto) {
    const { content, replyTo } = message;
    const data = {
      event: 'message',
      data: {
        userId: user.userId.toBigInt(),
        channelId: channelId.toBigInt(),
        content: message.content
      }
    };
  }

  authChallenge(client: WebSocket) {
    // client.send('auth');
    // send a challenge to the client
    // client sends back ACK with token
    // server verifies token
    // server can either accept or reject the connection
    // if accepted, server sends channel metadata
    // if rejected, server sends a message and closes the connection
  }
}

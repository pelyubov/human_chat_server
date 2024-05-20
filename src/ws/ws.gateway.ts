import { ConsoleLogger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';
import { IncomingMessage } from 'http';
import { AuthService } from '../auth/auth.service';
import { UserId } from '@Project.Utils/types';
import { UserManagerService } from '@Project.Managers/user-manager.service';
import { IUserMeta } from '@Project.Database/cql/schemas/users.schema';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';

// @UseGuards(AuthGuard)
@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer() private readonly server: Server;

  private readonly clients = new Map<UserId, WebSocket[]>();
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
  async handleConnection(client: WebSocket & IUserMeta, message: IncomingMessage) {
    const token = message.headers.authorization;
    if (!token) {
      this.logger.error(`${message.headers.origin} has no token`, 'WsGateway.Unauthorized');
      client.close();
      return;
    }
    const actualToken = token.split(' ')[1];
    try {
      const userId = await this.auth.verify(actualToken);
      if (!this.clients.has(userId)) {
        this.clients.set(userId, [client]);
      } else {
        this.clients.get(userId)!.push(client);
      }
      const userMeta = (await this.users.fetch(userId))!;
      const message = `User ${userMeta.display_name} (@${userMeta.username}) has connected.`;
      client.user_id = userId;
      Object.assign(client, userMeta);
      this.server.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          // c.send(JSON.stringify({ event: 'message', data: message }));
          c.send(message);
        }
      });
      this.logger.log(message, 'WsGateway');
      client.on('close', () => {
        this.clients.get(userId)!.splice(this.clients.get(userId)!.indexOf(client), 1);
        if (this.clients.get(userId)!.length) return;

        this.clients.delete(userId);
        const message = `User ${userMeta.display_name} (@${userMeta.username}) has disconnected.`;
        for (const c of this.server.clients) {
          if (c.readyState !== WebSocket.OPEN) continue;
          c.send(message);
        }
        this.logger.log(message, 'WsGateway');
      });
    } catch (e) {
      this.logger.error(`${e.message}, token: ${actualToken}`, 'WsGateway.Unauthorized');
      client.close();
    }
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
}

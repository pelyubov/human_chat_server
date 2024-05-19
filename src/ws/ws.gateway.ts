import { ConsoleLogger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';
import { AuthGuard } from '../auth/auth.guard';
import { IncomingMessage } from 'http';
import { AuthService } from '../auth/auth.service';
import { UserId } from '@Project.Utils/types';
import { UserManagerService } from '@Project.Managers/user-db.service';
import { IUserMeta } from '@Project.Database/cql/schemas/users.schema';

// @UseGuards(AuthGuard)
@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer() private readonly server: Server;

  private readonly clients = new Map<UserId, WebSocket[]>();
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly users: UserManagerService,
    private readonly auth: AuthService
  ) {
    this.logger.log('WsGateway initialized', 'WsGateway');
  }

  async handleConnection(client: WebSocket & IUserMeta, message: IncomingMessage, ...args: any[]) {
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
      const userMeta = (await this.users.getUserMeta(userId))!;
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
    } catch (e) {
      this.logger.error(
        `${e.message}, host: ${message.headers.origin}, token: ${actualToken}`,
        'WsGateway.Unauthorized'
      );
      client.close();
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string, @ConnectedSocket() client: WebSocket & IUserMeta) {
    this.logger.log('Message received', 'WsGateway');
    this.logger.log(message, 'WsGateway');
    // return { event: 'message', data: 'OK' };
    const data = {
      event: 'message',
      data: {
        userId: client.user_id.toNumber(),
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
}

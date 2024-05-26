import { ConsoleLogger, Inject, forwardRef } from '@nestjs/common';
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
import { UUID, randomUUID } from 'crypto';
import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { Long } from '@Project.Utils/types';

interface IUserSession extends WebSocket {
  clientId: UUID;
  userId: bigint;
  currentChannel?: bigint;
}

// @UseGuards(AuthGuard)
@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: WsServer;

  private readonly clients = new Map<bigint, Map<UUID, IUserSession>>();
  constructor(
    @Inject(forwardRef(() => ChannelManagerService))
    private readonly channels: ChannelManagerService,
    private readonly logger: ConsoleLogger,
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
      const userId = (await this.auth.verify(token)).userId.toBigInt();
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
    if (!this.clients.has(userId)) {
      return;
    }
    this.clients.get(userId)!.delete(clientId);
    this.logger.log(`Client(${clientId}) [User(${userId})] has disconnected.`, 'WsGateway');
  }

  broadcast(event: string, data: any, users: Iterable<bigint>, exclude?: Set<UUID>) {
    for (const userId of users) {
      if (!this.clients.has(userId)) continue;
      for (const client of this.clients.get(userId)!.values()) {
        if (exclude?.has(client.clientId)) continue;
        client.send(
          JSON.stringify({ event, data }, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        );
      }
    }
  }

  @SubscribeMessage('typing')
  async onTyping(
    @ConnectedSocket() client: IUserSession,
    @MessageBody('channelId') channelId: string
  ) {
    this.channels.broadcastEvent('typing', { userId: client.userId }, Long.fromString(channelId));
  }

  @SubscribeMessage('typingStop')
  async onTypingStop(
    @ConnectedSocket() client: IUserSession,
    @MessageBody('channelId') channelId: string
  ) {
    this.channels.broadcastEvent(
      'typingStop',
      { userId: client.userId },
      Long.fromString(channelId)
    );
  }
}

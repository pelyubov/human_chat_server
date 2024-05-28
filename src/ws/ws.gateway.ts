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
  socketId: UUID;
  userId: bigint;
  currentChannel?: bigint;
}

// @UseGuards(AuthGuard)
@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: WsServer;

  private readonly clients = new Map<bigint, Map<UUID, IUserSession>>();
  private readonly challengeTimeouts = new Map<UUID, NodeJS.Timeout>();
  constructor(
    @Inject(forwardRef(() => ChannelManagerService))
    private readonly channels: ChannelManagerService,
    private readonly logger: ConsoleLogger,
    private readonly auth: AuthService
  ) {
    this.logger.log('WsGateway initialized', 'WsGateway');
  }

  async authChallenge(client: IUserSession) {
    client.send(
      JSON.stringify({
        event: 'tokenChallenge'
      })
    );
    this.challengeTimeouts.set(
      client.socketId,
      setTimeout(() => {
        client.send(
          JSON.stringify({
            event: 'tokenChallengeTimeout'
          })
        );
        client.close();
        this.logger.log(
          `Client(${client.socketId}) has been disconnected due lack of response.`,
          'WsGateway'
        );
      }, 10000)
    );
  }

  @SubscribeMessage('tokenChallengeResponse')
  async onTokenResponse(
    @ConnectedSocket() client: IUserSession,
    @MessageBody('token') token: string
  ) {
    try {
      const { userId } = await this.auth.verify(token);
      client.userId = userId.toBigInt();
      this.logger.log(`Client(${client.socketId}) passed the token challenge.`, 'WsGateway');
      client.send(
        JSON.stringify({
          event: 'tokenAccepted'
        })
      );
      clearTimeout(this.challengeTimeouts.get(client.socketId)!);
      this.onConnectSucessful(client, userId.toBigInt());
    } catch (e) {
      client.send(
        JSON.stringify({
          event: 'tokenRejected'
        })
      );
      this.logger.error(`${e.message}, ${e.message}: ${token}`, 'WsGateway.Unauthorized');
      client.close();
    }
  }

  async handleConnection(client: IUserSession, message: IncomingMessage) {
    const token = message.headers.authorization;
    const socketId = randomUUID();
    client.socketId = socketId;

    if (!token) {
      this.logger.log(`Client(${client.socketId}) has no token`, 'WsGateway.Unauthorized');
      this.logger.log(`Sending challenge to Client(${client.socketId})`, 'WsGateway');
      this.authChallenge(client);
      return;
    }
    try {
      const userId = (await this.auth.verify(token)).userId.toBigInt();
      this.onConnectSucessful(client, userId);
    } catch (e) {
      this.logger.error(`${e.message}, token: ${token}`, 'WsGateway.Unauthorized');
      client.close();
    }
  }

  onConnectSucessful(client: IUserSession, userId: bigint) {
    client.userId = userId;
    if (this.clients.has(userId)) {
      this.clients.get(userId)!.set(client.socketId, client);
    } else {
      this.clients.set(userId, new Map([[client.socketId, client]]));
    }
    this.logger.log(`Client(${client.socketId}) [User(${userId})] has connected.`, 'WsGateway');
  }

  async handleDisconnect(client: IUserSession) {
    const { userId, socketId: clientId } = client;
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
        if (exclude?.has(client.socketId)) continue;
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

  @SubscribeMessage('typingStopped')
  async onTypingStopped(
    @ConnectedSocket() client: IUserSession,
    @MessageBody('channelId') channelId: string
  ) {
    this.channels.broadcastEvent(
      'typingStopped',
      { userId: client.userId },
      Long.fromString(channelId)
    );
  }
}

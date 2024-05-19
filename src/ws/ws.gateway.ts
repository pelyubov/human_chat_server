import { ConsoleLogger } from '@nestjs/common';
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

@WebSocketGateway(3001)
export class WsGateway implements OnGatewayConnection {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('WsGateway initialized', 'WsGateway');
  }

  @WebSocketServer() private readonly server: Server;

  handleConnection(client: WebSocket, ...args: any[]): any {
    this.logger.log('Client connected', 'WsGateway');
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: WebSocket): WsResponse {
    this.logger.log('Message received', 'WsGateway');
    this.logger.log(data, 'WsGateway');
    return { event: 'message', data: 'OK' };
  }
}

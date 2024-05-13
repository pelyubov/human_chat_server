import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';
import { IMessageService } from './message.service.interface';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  io: Server;

  private readonly messageService: IMessageService;
  constructor() {
    this.messageService = new MessageService();
  }

  afterInit(server: any) {
    console.warn('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    console.warn('Connected', client.id);
    this.io.socketsJoin(client.id);
  }

  handleDisconnect(client: any) {
    console.warn('Disconnected', client.id);
  }

  @SubscribeMessage('makeCall')
  onMakeCall(@MessageBody() data: any) {
    let callerId = data.callerId;
    let calleeId = data.calleeId;
    let sdpOffer = data.sdpOffer;
    this.io.to(calleeId).emit('newCall', { callerId: callerId, sdpOffer: sdpOffer });
  }

  @SubscribeMessage('answerCall')
  onAnswerCall(@MessageBody() data: any) {
    let callerId = data.callerId;
    let sdpAnswer = data.sdpAnswer;
    this.io.to(callerId).emit('callAnswered', { sdpAnswer: sdpAnswer });
  }

  @SubscribeMessage('iceCandidate')
  onIceCandidate(@MessageBody() data: any) {
    let callerId = data.callerId;
    let calleeId = data.calleeId;
    let iceCandidate = data.iceCandidate;

    this.io.to(calleeId).emit('IceCandidate', {
      sender: callerId,
      iceCandidate: iceCandidate,
    });
  }

  @SubscribeMessage('messages')
  async onMessages(
    @MessageBody() data: { sender: bigint; receiver: bigint; input: CreateMessageDto },
  ) {
    const message = await this.messageService.create(data.sender, data.input);
    this.io
      .to(data.receiver.toString())
      .emit('recieveMessages', { sender: data.sender, message: message });
  }

  @SubscribeMessage('editMessage')
  async onEditMessage(@MessageBody() data: { id: bigint; input: EditMessageDto }) {
    const message = await this.messageService.edit(data.id, data.input);
    if (message) {
      this.io.to(data.id.toString()).emit('editMessage', { message: message });
    }
  }

  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(@MessageBody() data: { id: bigint }) {
    const message = await this.messageService.delete(data.id);
    if (message) {
      this.io.to(data.id.toString()).emit('deleteMessage', { message: message });
    }
  }

  @SubscribeMessage('getMessages')
  async onGetMessages(@MessageBody() data: { sender: bigint }) {
    throw new Error('Method not implemented.');
  }

  // @SubscribeMessage('events')
  // findAll(@MessageBody() sdata: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  // }

  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }
}

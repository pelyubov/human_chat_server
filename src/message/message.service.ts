import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';
import { Message } from '../entities/message.entity';
import { IMessageService } from './message.interface.service';

@Injectable()
export class MessageService implements IMessageService {
  constructor() {}
  create(id: bigint, input: CreateMessageDto): Promise<Message> {
    throw new Error('Method not implemented.');
  }
  get(id: bigint): Promise<Message> {
    throw new Error('Method not implemented.');
  }
  delete(id: bigint): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  edit(id: bigint, input: EditMessageDto): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

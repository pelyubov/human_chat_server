import { Injectable } from '@nestjs/common';
import dummyDB from '@Project.Database/db_test';
import { Message } from '@Project.Entities/message.entity';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';
import { IMessageService } from './message.service.interface';

@Injectable()
export class MessageService implements IMessageService {
  constructor() {
  }

  create(id: bigint, input: CreateMessageDto): Promise<Message> {
  }

  get(id: bigint): Promise<Message> {
  }

  delete(id: bigint): Promise<boolean> {
  }
  edit(id: bigint, input: EditMessageDto): Promise<boolean> {
  }
}

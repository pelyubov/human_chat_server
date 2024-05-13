import { Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';
import { Message } from '../entities/message.entity';
import { IMessageService } from './message.interface.service';

@Injectable()
export class MessageService implements IMessageService {
  constructor() {}
  create(id: bigint, input: CreateMessageDto): Promise<Message> {
    throw new Error('Method not implemented.');
=======
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
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178
  }
  get(id: bigint): Promise<Message> {
<<<<<<< HEAD
    throw new Error('Method not implemented.');
=======
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178
  }
  delete(id: bigint): Promise<boolean> {
<<<<<<< HEAD
    throw new Error('Method not implemented.');
  }
  edit(id: bigint, input: EditMessageDto): Promise<boolean> {
    throw new Error('Method not implemented.');
=======
  }
  edit(id: bigint, input: EditMessageDto): Promise<boolean> {
>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178
  }
}

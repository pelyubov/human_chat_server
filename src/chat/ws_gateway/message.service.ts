import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dtos/create_message.dto';
import { IMessageService } from './message.interface.service';
import { EditMessageDto } from './dtos/edit_message.dto';
import dummyDB from 'src/core/db/db_test';

@Injectable()
export class MessageService implements IMessageService {
  dummyMessages: any;

  constructor() {
    this.dummyMessages = dummyDB.messages;
  }

  create(id: BigInt, input: CreateMessageDto): Promise<Message> {
    const newMessage: Message = {
      id: id,
      content: input.content,
      type: input.type,
      createdAt: new Date(),
    };

    if (input.replyTo) {
      newMessage.replyTo = input.replyTo;
    }

    if (input.attachments) {
      newMessage.attachments = input.attachments;
    }

    this.dummyMessages.push(newMessage);
    return Promise.resolve(newMessage);
  }

  get(id: BigInt): Promise<Message> {
    for (const message of this.dummyMessages) {
      if (message.id === id) {
        return Promise.resolve(message);
      }
    }
    return Promise.resolve(null);
  }

  delete(id: BigInt): Promise<boolean> {
    for (const message of this.dummyMessages) {
      if (message.id === id) {
        message.isDeleted = true;
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
  edit(id: BigInt, input: EditMessageDto): Promise<boolean> {
    for (const message of this.dummyMessages) {
      if (message.id === id) {
        message.content = input.content;
        message.type = input.type;
        message.replyTo = input.replyTo;
        message.attachments = input.attachments;
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
}

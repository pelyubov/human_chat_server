import { MessageId } from '@Project.Utils/types';
import { Message } from '@Project.Entities/message.entity';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';

export interface IMessageService {
  create(id: MessageId, input: CreateMessageDto): Promise<Message>;
  get(id: MessageId): Promise<Message>;
  delete(id: MessageId): Promise<Message>;
  edit(id: MessageId, input: EditMessageDto): Promise<Message>;
}

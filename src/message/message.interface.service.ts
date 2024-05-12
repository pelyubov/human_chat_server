import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';
import { Message } from './message.entity';

export interface IMessageService {
  create(id: bigint, input: CreateMessageDto): Promise<Message>;
  get(id: bigint): Promise<Message>;
  delete(id: bigint): Promise<boolean>;
  edit(id: bigint, input: EditMessageDto): Promise<boolean>;
}

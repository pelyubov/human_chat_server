import { Message } from '../entities/message';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { EditMessageDto } from './dtos/editMessage.dto';

export interface IMessageService {
  create(id: BigInt, input: CreateMessageDto): Promise<Message>;
  get(id: BigInt): Promise<Message>;
  delete(id: BigInt): Promise<boolean>;
  edit(id: BigInt, input: EditMessageDto): Promise<boolean>;
}

import Message from '../entities/message';
import { CreateMessageDto } from './dtos/create_message.dto';
import { EditMessageDto } from './dtos/edit_message.dto';

export interface IMessageService {
  create(id: BigInt, input: CreateMessageDto): Promise<Message>;
  get(id: BigInt): Promise<Message>;
  delete(id: BigInt): Promise<boolean>;
  edit(id: BigInt, input: EditMessageDto): Promise<boolean>;
}

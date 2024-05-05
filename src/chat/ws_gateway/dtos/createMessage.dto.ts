export class CreateMessageDto {
  content: string;
  type: string;
  createdAt: Date;
  replyTo?: BigInt;
  attachments?: string[];
}

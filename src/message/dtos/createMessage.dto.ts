export class CreateMessageDto {
  content: string;
  type: string;
  createdAt: Date;
  replyTo?: bigint;
  attachments?: string[];
}

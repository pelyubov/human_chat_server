export class EditMessageDto {
  content: string;
  type: string;
  replyTo?: BigInt;
  attachments?: string[];
}

export class EditMessageDto {
  content: string;
  type: string;
  replyTo?: bigint;
  attachments?: string[];
}

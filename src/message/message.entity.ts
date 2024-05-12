export class Message {
  id: bigint;
  content: string;
  type: string;
  createdAt: Date;
  replyTo?: bigint;
  attachments?: string[];
  isDeleted? = false;
  constructor(
    id: bigint,
    content: string,
    type: string,
    createdAt: Date,
    replyTo?: bigint,
    attrachments?: string[],
    isDeleted?: boolean,
  ) {
    this.id = id;
    this.content = content;
    this.type = type;
    this.createdAt = createdAt;
    this.replyTo = replyTo;
    this.attachments = attrachments;
    this.isDeleted = isDeleted;
  }
}

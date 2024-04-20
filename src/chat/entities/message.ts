class Message {
  id: BigInt;
  content: string;
  type: string;
  createdAt: Date;
  replyTo?: BigInt;
  attrachments?: string[];
  isDeleted? = false;
  constructor(
    id: BigInt,
    content: string,
    type: string,
    createdAt: Date,
    replyTo?: BigInt,
    attrachments?: string[],
    isDeleted?: boolean,
  ) {
    this.id = id;
    this.content = content;
    this.type = type;
    this.createdAt = createdAt;
    this.replyTo = replyTo;
    this.attrachments = attrachments;
    this.isDeleted = isDeleted;
  }
}

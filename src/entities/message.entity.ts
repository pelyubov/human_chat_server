import Snowflake from '@Project.Utils/snowflake';
import { todo } from '@Project.Utils/common';
import { MessageId } from '@Project.Utils/types';

export class Message {
  constructor(
    public readonly id: MessageId,
    public content: string,
    public type: string,
    public readonly replyTo?: MessageId,
    public attachments = [],
    public isDeleted = false
  ) {}
  timestamp() {
    return new Date(Snowflake.timestamp(this.id));
  }
  edit(content: string) {
    todo!('TODO: message#edit: Write to database');
    this.content = content;
  }
}

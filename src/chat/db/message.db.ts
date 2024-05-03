import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
import Message from '../entities/message';

type QueriesFieldGetMessage = {
  id?: BigInt;
  content?: string;
  createAt?: Date;
  replyTo?: BigInt;
};

export default class MessageDbContext {
  private static _instance: MessageDbContext;
  constructor(
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer,
  ) {
    if (MessageDbContext._instance) {
      return MessageDbContext._instance;
    }

    MessageDbContext._instance = this;
  }

  static get instance(): MessageDbContext {
    if (!this._instance) {
      throw new Error('ChatDbContext is not initialized');
    }
    return this._instance;
  }

  getMessage(messageId: BigInt) {
    this.producer.send({
      topic: 'get-message',
      messages: [
        {
          value: JSON.stringify({ id: messageId }),
        },
      ],
    });
  }

  getMessagesByContainSubContent(userId: BigInt, keyword: string) {
    this.producer.send({
      topic: 'get-messages-by-contain-sub-content',
      messages: [
        {
          value: JSON.stringify({ userId: userId, keyword: keyword }),
        },
      ],
    });
  }

  getMessagesByReplyTo(userId: BigInt, replyTo: BigInt) {
    this.producer.send({
      topic: 'get-messages-by-reply-to',
      messages: [
        {
          value: JSON.stringify({ userId: userId, replyTo: replyTo }),
        },
      ],
    });
  }

  getMessagesByDay(userId: BigInt, day: Date) {
    this.producer.send({
      topic: 'get-messages-by-day',
      messages: [
        {
          value: JSON.stringify({ userId: userId, day: day }),
        },
      ],
    });
  }

  getMessagesByPeriod(userId: BigInt, start: Date, end: Date) {
    //TODO which is better (use getMessagesByDay)
    // this.producer.send({
    //   topic: 'get-messages-by-period',
    //   messages: [{
    //     value: JSON.stringify({userId: userId, start: start, end: end})
    //   }],
    // })
  }

  editMessage(messageId: BigInt, newContent: string) {
    this.producer.send({
      topic: 'edit-message',
      messages: [
        {
          value: JSON.stringify({ messageId: messageId, newContent: newContent }),
        },
      ],
    });
  }

  deleteMessage(messageId: BigInt) {
    this.producer.send({
      topic: 'delete-message',
      messages: [
        {
          value: JSON.stringify({ messageId: messageId }),
        },
      ],
    });
  }

  createMessage(userId: BigInt, message: Message) {
    this.producer.send({
      topic: 'create-message',
      messages: [
        {
          value: JSON.stringify({ userId: userId, message: message }),
        },
      ],
    });
  }
}

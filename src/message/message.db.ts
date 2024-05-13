import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
import { Message } from '../entities/message.entity';

type QueriesFieldGetMessage = {
  id?: bigint;
  content?: string;
  createAt?: Date;
  replyTo?: bigint;
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

  getMessage(messageId: bigint) {
    this.producer.send({
      topic: 'get-message',
      messages: [
        {
          value: JSON.stringify({ id: messageId }),
        },
      ],
    });
    this.consumer.subscribe({ topic: 'get-message', fromBeginning: true });
    this.consumer.run({
      eachMessage: async ({ message }) => {
        console.log(message.value.toString());
      },
    });
  }

  getMessagesByContainSubContent(userId: bigint, keyword: string) {
    this.producer.send({
      topic: 'get-messages-by-contain-sub-content',
      messages: [
        {
          value: JSON.stringify({ userId: userId, keyword: keyword }),
        },
      ],
    });
  }

  getMessagesByReplyTo(userId: bigint, replyTo: bigint) {
    this.producer.send({
      topic: 'get-messages-by-reply-to',
      messages: [
        {
          value: JSON.stringify({ userId: userId, replyTo: replyTo }),
        },
      ],
    });
  }

  getMessagesByDay(userId: bigint, day: Date) {
    this.producer.send({
      topic: 'get-messages-by-day',
      messages: [
        {
          value: JSON.stringify({ userId: userId, day: day }),
        },
      ],
    });
  }

  getMessagesByPeriod(userId: bigint, start: Date, end: Date) {
    //TODO which is better (use getMessagesByDay)
    // this.producer.send({
    //   topic: 'get-messages-by-period',
    //   messages: [{
    //     value: JSON.stringify({userId: userId, start: start, end: end})
    //   }],
    // })
  }

  editMessage(messageId: bigint, newContent: string) {
    this.producer.send({
      topic: 'edit-message',
      messages: [
        {
          value: JSON.stringify({ messageId: messageId, newContent: newContent }),
        },
      ],
    });
  }

  deleteMessage(messageId: bigint) {
    this.producer.send({
      topic: 'delete-message',
      messages: [
        {
          value: JSON.stringify({ messageId: messageId }),
        },
      ],
    });
  }

  createMessage(userId: bigint, message: Message) {
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

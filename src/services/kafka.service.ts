import { EmptyFn } from '@Project.Utils/common';
import { Injectable } from '@nestjs/common';
import EventEmitter from 'events';
import {
  Kafka as KafkaClient,
  Consumer as KafkaConsumer,
  Producer as KafkaProducer
} from 'kafkajs';

interface KafkaMessage {
  topic: string;
  message: string;
  partition: number;
}

interface KafkaEvent {
  connecting: EmptyFn;
  error: (error: Error) => void;
  ready: EmptyFn;
  close: EmptyFn;
  message: (message: KafkaMessage) => void;
}

enum KafkaEvents {
  CONNECTING = 'connecting',
  ERROR = 'error',
  READY = 'ready',
  CLOSE = 'close',
  MESSAGE = 'message'
}

@Injectable()
export class KafkaService extends EventEmitter {
  constructor(
    private consumer: KafkaConsumer,
    private producer: KafkaProducer
  ) {
    super();
    this.emit(KafkaEvents.CONNECTING);
    this.consumer.on('consumer.crash', this.emit.bind(this, KafkaEvents.ERROR));
    this.consumer.on('consumer.connect', this.emit.bind(this, KafkaEvents.READY));
    this.consumer.on('consumer.disconnect', this.emit.bind(this, KafkaEvents.CLOSE));
    this.consumer.subscribe({ topic: 'sent-message' });
    this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.emit(KafkaEvents.MESSAGE, { topic, partition, message: message.value.toString() });
      }
    });
  }
}

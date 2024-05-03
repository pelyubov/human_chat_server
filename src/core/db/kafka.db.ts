import { Consumer, ConsumerConfig, Kafka, KafkaConfig, Producer, ProducerConfig } from 'kafkajs';
import IDbContext from './db.abstract';
import DbState from './state.db';

const {
  KAFKA_CLIENT_ID: kafkaClientId,
  KAFKA_GROUP_ID: kafkaGroupId,
  KAFKA_NAT_BROKER0: kafkaNatBroker0,
  KAFKA_NAT_BROKER1: kafkaNatBroker1,
} = process.env;

const NAT_BROKERS = [kafkaNatBroker0, kafkaNatBroker1].map((broker, i) => `${broker}:${2 + i}9093`); // work but has to manually add to /etc/hosts

const clientId = kafkaClientId;
const groupId = kafkaGroupId;

const kafkaConfig: KafkaConfig = {
  clientId: clientId,
  brokers: NAT_BROKERS,
};

const produceConfig: ProducerConfig = {
  metadataMaxAge: 3000,
};

const consumerConfig: ConsumerConfig = {
  groupId: groupId,
};

export default class KafkaDbContext extends IDbContext {
  private static _instance: KafkaDbContext;
  private kafka: Kafka;
  private _producer: Producer; // write
  private _consumer: Consumer; // read

  constructor(
    private kafkaConfig: KafkaConfig,
    private produceConfig?: ProducerConfig,
    private consumerConfig?: ConsumerConfig,
  ) {
    if (KafkaDbContext._instance) {
      return KafkaDbContext._instance;
    }
    super();
    this.kafka = new Kafka(kafkaConfig);
    this._producer = this.kafka.producer(produceConfig);
    this._consumer = this.kafka.consumer(consumerConfig);
    KafkaDbContext._instance = this;
  }

  public static get instance(): KafkaDbContext {
    if (!this._instance) {
      throw new Error('KafkaDbContext is not initialized');
    }
    return this._instance;
  }

  public get producer(): Producer {
    if (!KafkaDbContext.instance) {
      throw new Error('KafkaDbContext is not initialized');
    }
    return KafkaDbContext.instance._producer;
  }

  public get consumer(): Consumer {
    if (!KafkaDbContext.instance) {
      throw new Error('KafkaDbContext is not initialized');
    }
    return KafkaDbContext.instance._consumer;
  }

  protected async connect(): Promise<void> {
    if (this.connectionState === DbState.CONNECTED) {
      return;
    }
    this.connectionState = DbState.CONNECTING;
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.connectionState = DbState.CONNECTING;
        await this._producer.connect();
        await this._consumer.connect();
        this.connectionState = DbState.CONNECTED;
        this.emit(DbState.CONNECTED);
        resolve();
      } catch (e) {
        this.connectionState = DbState.ERROR;
        this.emit(DbState.ERROR, e);
        reject(e);
      }
    });
  }

  protected async disconnect(): Promise<void> {
    await this._producer.disconnect();
    await this._consumer.disconnect();
    this.connectionState = DbState.DISCONNECTED;
    this.emit(DbState.DISCONNECTED);
  }
}

new KafkaDbContext(kafkaConfig, produceConfig, consumerConfig);

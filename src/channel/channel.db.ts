import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
import { Channel } from '../entities/channel.entity';
import { GraphTraversalSource } from '@Project.Root/db/graph.db';

interface IChatDbContext {
  create(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any>;
  get(id: bigint): Promise<Channel>;
  update(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any>;
  delete(id: bigint): Promise<any>;
  getChatList(userID: bigint): Promise<GetChannelInfoDto[]>;
  getUsersIdInGroup(groupID: bigint): Promise<bigint[]>;
}

export class ChannelDbContext implements IChatDbContext {
  private static _instance: ChannelDbContext;
  private tableName = 'chats';
  constructor(
    private g?: GraphTraversalSource,
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer
  ) {
    if (ChannelDbContext._instance) {
      return ChannelDbContext._instance;
    }

    ChannelDbContext._instance = this;
  }
  async create(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any> {
    return await this.producer.send({
      topic: 'create-chat',
      messages: [
        {
          value: JSON.stringify({ id: id, name: name, avatar: avatar, members: members })
        }
      ]
    });
  }
  async get(id: bigint): Promise<Channel> {
    const query = 'Select * from ' + this.tableName + ` where id = ${id}`;
    const result = await this.table.execute(query);
    throw new Error('Method not implemented.');
  }
  async update(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any> {
    return await this.producer.send({
      topic: 'update-chat',
      messages: [
        {
          value: JSON.stringify({ id: id, name: name, avatar: avatar, members: members })
        }
      ]
    });
  }
  async delete(id: bigint): Promise<any> {
    return await this.producer.send({
      topic: 'delete-chat',
      messages: [
        {
          value: JSON.stringify({ id: id })
        }
      ]
    });
  }
  async getChatList(userID: bigint): Promise<GetChannelInfoDto[]> {
    await this.producer.send({
      topic: 'get-chat-list',
      messages: [
        {
          value: JSON.stringify({ userID: userID })
        }
      ]
    });
    throw new Error('Method not implemented.');
  }
  getUsersIdInGroup(groupID: bigint): Promise<bigint[]> {
    throw new Error('Method not implemented.');
  }

  public static get instance(): ChannelDbContext {
    if (!this._instance) {
      throw new Error('ChatDbContext is not initialized');
    }
    return this._instance;
  }
}

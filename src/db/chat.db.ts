import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
<<<<<<<< HEAD:src/channel/channel.db.ts
import { Channel } from '../entities/channel.entity';
import { GraphTraversalSource } from '@Project.Root/db/graph.db';

interface IChatDbContext {
  create(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any>;
  get(id: bigint): Promise<Channel>;
========
import { GraphTraversalSource } from '@Project.Database/graph.db';
import { Group } from '../entities/chat.entity';

interface IChatDbContext {
  create(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any>;
  get(id: bigint): Promise<Group>;
>>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/db/chat.db.ts
  update(id: bigint, name: string, avatar: string, members: bigint[]): Promise<any>;
  delete(id: bigint): Promise<any>;
  getChatList(userID: bigint): Promise<GetChannelInfoDto[]>;
  getUsersIdInGroup(groupID: bigint): Promise<bigint[]>;
}

export class ChatDbContext implements IChatDbContext {
  private static _instance: ChatDbContext;
  private tableName = 'chats';
  constructor(
    private g?: GraphTraversalSource,
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer
  ) {
    if (ChatDbContext._instance) {
      return ChatDbContext._instance;
    }

    ChatDbContext._instance = this;
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
<<<<<<<< HEAD:src/channel/channel.db.ts
  async get(id: bigint): Promise<Channel> {
========
  async get(id: bigint): Promise<Group> {
>>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/db/chat.db.ts
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

  public static get instance(): ChatDbContext {
    if (!this._instance) {
      throw new Error('ChatDbContext is not initialized');
    }
    return this._instance;
  }
}

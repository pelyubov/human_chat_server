import { Client } from 'cassandra-driver';
import { Consumer, Producer } from 'kafkajs';
import { GraphTraversalSource } from 'src/core/db/graph.db';
import { User } from 'src/user/entities/user.enity';
import { GroupChat } from '../entities/groupchat.entity';

interface IChatDbContext {
  create(id: BigInt, name: string, avatar: string, members: BigInt[]): Promise<void>;
  get(id: BigInt): Promise<GroupChat>;
  update(id: BigInt, name: string, avatar: string, members: BigInt[]): Promise<boolean>;
  delete(id: BigInt): Promise<boolean>;
  getChatList(userID: BigInt): Promise<GroupChat[]>;
  getUserInGroup(groupID: BigInt): Promise<User[]>;
}

export class ChatDbContext {
  private static _instance: ChatDbContext;
  private tableName = 'chats';
  constructor(
    private g?: GraphTraversalSource,
    private table?: Client,
    private producer?: Producer,
    private consumer?: Consumer,
  ) {
    if (ChatDbContext._instance) {
      return ChatDbContext._instance;
    }

    ChatDbContext._instance = this;
  }

  public static get instance(): ChatDbContext {
    if (!this._instance) {
      throw new Error('ChatDbContext is not initialized');
    }
    return this._instance;
  }
}

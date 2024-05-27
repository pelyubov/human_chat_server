import { CqlDbContext } from '@Project.Database/cql.db.service';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import type { IMessageMeta } from '@Project.Database/schemas/message.schema';
import { IIncomingMessageDto } from '@Project.Dtos/message.dto';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { ChannelId, Long, MessageId, Nullable, UserId } from '@Project.Utils/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConsoleLogger,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ChannelManagerService } from './channel-manager.service';

@Injectable()
export class MessageManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly channels: ChannelManagerService,
    private readonly cqlDb: CqlDbContext,
    private readonly snowflake: SnowflakeService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('MessageManagerService initialized', 'MessageManagerService');
  }

  get model() {
    return this.cqlDb.model('Messages') as ModelInstance<IMessageMeta>;
  }

  async getMessages(channelId: ChannelId, count: number, tokenId: MessageId) {
    const result = await this.model.findAsync(
      {
        message_id: {
          $token: {
            $lt: tokenId
          }
        },
        channel_id: channelId,
        $limit: count,
        $orderby: {
          $desc: ['message_id']
        }
      },
      {
        raw: true
      }
    );
    for (const message of result) {
      this.cache.set(`message:${message.message_id}`, message);
    }
    return result;
  }

  async get(messageId: MessageId) {
    const cached = await this.cache.get<IMessageMeta>(`message:${messageId}`);
    if (cached) return cached;
    return this.fetch(messageId);
  }

  async fetch(messageId: MessageId) {
    const message = await this.model.findOneAsync({ message_id: messageId });
    if (!message) {
      return null;
    }
    this.cache.set(`message:${messageId}`, message);
    return message;
  }

  async create(channelId: ChannelId, userId: UserId, content: string, replyTo?: Nullable<Long>) {
    if (replyTo && !(await this.get(replyTo))) {
      throw new BadRequestException('Unknown message.');
    }
    const message: IMessageMeta = {
      message_id: this.snowflake.next(),
      author_id: userId,
      channel_id: channelId,
      content,
      last_edit: null,
      reply_to: replyTo ?? null
    };
    await new this.model(message).saveAsync();
    return message as IMessageMeta;
  }

  async edit(userId: UserId, messageId: MessageId, data: Omit<IIncomingMessageDto, 'replyTo'>) {
    const message = await this.model.findOneAsync({ message_id: messageId });
    if (!message) {
      throw new BadRequestException('Unknown message.');
    }
    if (message.author_id.ne(userId)) {
      throw new UnauthorizedException('You are not the author of this message.');
    }
    message.content = data.content;
    message.last_edit = Date.now();
    await message.saveAsync();
    this.cache.del(`message:${messageId}`);
    this.channels.broadcastEvent(
      'messageEdited',
      { messageId, content: data.content, when: message.last_edit },
      message.channel_id
    );
    return message as IMessageMeta;
  }

  async invalidateCache(messageId: MessageId) {
    return this.cache.del(`message:${messageId}`);
  }

  async delete(userId: UserId, messageId: MessageId) {
    const message = await this.model.findOneAsync({ message_id: messageId });
    if (!message) {
      throw new BadRequestException('Unknown message.');
    }
    if (message.author_id.ne(userId)) {
      throw new UnauthorizedException('You are not the author of this message.');
    }
    await message.deleteAsync({ message_id: messageId });
    this.cache.del(`message:${messageId}`);
    this.channels.broadcastEvent('messageDeleted', { messageId }, message.channel_id);
    return { message: 'Message deleted successfully' };
  }
}

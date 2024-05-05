import { ChatGateway } from './chat.gateway';
import { Module } from '@nestjs/common';
@Module({
  providers: [ChatGateway],
})
export class ChatWsGatewayModule {}

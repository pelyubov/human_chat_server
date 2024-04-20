import { Module } from '@nestjs/common';
import { ChatWsGatewayModule } from './ws_gateway/chat.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [ChatWsGatewayModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}

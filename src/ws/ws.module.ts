import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

@Module({
  imports: [CommonServicesModule],
  providers: [WsGateway],
  exports: [WsGateway]
})
export class WsModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('WsModule initialized', 'WebSocketModule');
  }
}

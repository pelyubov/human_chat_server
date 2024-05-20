import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [CommonServicesModule, AuthModule],
  providers: [WsGateway],
  exports: [WsGateway]
})
export class WsModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('WsModule initialized', 'WebSocketModule');
  }
}

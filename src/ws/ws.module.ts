import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module, forwardRef } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { ManagersModule } from '@Project.Managers/managers.module';
@Global()
@Module({
  imports: [CommonServicesModule, AuthModule, forwardRef(() => ManagersModule)],
  providers: [WsGateway],
  exports: [WsGateway]
})
export class WsModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('WsModule initialized', 'WebSocketModule');
  }
}

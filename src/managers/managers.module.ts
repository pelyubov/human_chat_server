import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module, forwardRef } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { ChannelManagerService } from './channel-manager.service';
import { WsModule } from '../ws/ws.module';
import { AuthModule } from '../auth/auth.module';
import { MessageManagerService } from './message-manager.service';

@Global()
@Module({
  imports: [CommonServicesModule, DbModule, AuthModule, forwardRef(() => WsModule)],
  providers: [UserManagerService, ChannelManagerService, MessageManagerService],
  exports: [UserManagerService, ChannelManagerService, MessageManagerService]
})
export class ManagersModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('ManagersModule initialized', 'ManagersModule');
  }
}

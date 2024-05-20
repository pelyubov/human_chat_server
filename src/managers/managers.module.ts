import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { ChannelManagerService } from './channel-manager.service';

@Global()
@Module({
  imports: [CommonServicesModule, DbModule],
  providers: [UserManagerService, ChannelManagerService],
  exports: [UserManagerService, ChannelManagerService]
})
export class ManagersModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('ManagersModule initialized', 'ManagersModule');
  }
}

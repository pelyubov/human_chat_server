import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module } from '@nestjs/common';
import { UserManagerService } from './user-db.service';

@Global()
@Module({
  imports: [CommonServicesModule, DbModule],
  providers: [UserManagerService],
  exports: [UserManagerService]
})
export class ManagersModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('ManagersModule initialized', 'ManagersModule');
  }
}

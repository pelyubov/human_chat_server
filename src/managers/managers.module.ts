import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ConsoleLogger, Global, Module } from '@nestjs/common';
import { UserDbService } from './user-db.service';

@Global()
@Module({
  imports: [CommonServicesModule, DbModule],
  providers: [UserDbService],
  exports: [UserDbService]
})
export class ManagersModule {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.log('ManagersModule initialized', 'ManagersModule');
  }
}

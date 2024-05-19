import { Module } from '@nestjs/common';
import { DevController } from './controllers/dev.controller';
import { AuthModule } from './auth/auth.module';
import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from './services/services.module';
import { ManagersModule } from './managers/managers.module';
import { SignUpController } from '@Project.Controllers/signup.controller';

@Module({
  imports: [CommonServicesModule, DbModule, ManagersModule, AuthModule],
  providers: [],
  controllers: [DevController, SignUpController]
})
export class AppModule {}

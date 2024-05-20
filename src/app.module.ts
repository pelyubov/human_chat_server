import { Module } from '@nestjs/common';
import { DevController } from '@Project.Controllers/dev.controller';
import { SignUpController } from '@Project.Controllers/signup.controller';
import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { ManagersModule } from '@Project.Managers/managers.module';
import { AuthModule } from './auth/auth.module';
import { WsModule } from './ws/ws.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      max: 4000,
      ttl: 60000,
      isGlobal: true
    }),
    CommonServicesModule,
    DbModule,
    ManagersModule,
    AuthModule,
    WsModule
  ],
  providers: [],
  controllers: [DevController, SignUpController]
})
export class AppModule {}

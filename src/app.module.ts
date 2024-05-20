import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { DevController } from '@Project.Controllers/dev.controller';
import { SignUpController } from '@Project.Controllers/signup.controller';
import { ChannelController } from '@Project.Controllers/chat.controller';
import { DbModule } from '@Project.Database/db.module';
import { ManagersModule } from '@Project.Managers/managers.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { AuthModule } from './auth/auth.module';
import { WsModule } from './ws/ws.module';

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
    WsModule,
    AuthModule
  ],
  providers: [],
  controllers: [DevController, SignUpController, ChannelController]
})
export class AppModule {}

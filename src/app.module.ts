import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { DevController } from '@Project.Controllers/dev.controller';
import { UserController } from '@Project.Controllers/user.controller';
import { ChannelController } from '@Project.Controllers/channel.controller';
import { DbModule } from '@Project.Database/db.module';
import { ManagersModule } from '@Project.Managers/managers.module';
import { CommonServicesModule } from '@Project.Services/services.module';
import { AuthModule } from './auth/auth.module';
import { WsModule } from './ws/ws.module';
import { MessageController } from '@Project.Controllers/message.controller';

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
  controllers: [DevController, UserController, ChannelController, MessageController]
})
export class AppModule {}

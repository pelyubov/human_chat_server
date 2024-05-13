import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ChannelModule, UserModule, AuthModule],
  controllers: [AppController]
})
export class AppModule {}

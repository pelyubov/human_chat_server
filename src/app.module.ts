import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [ChatModule, UserModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}

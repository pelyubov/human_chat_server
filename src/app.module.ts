import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DbModule } from '@Project.Database/db.module';
import { CommonServicesModule } from './common-services.module';

@Module({
  imports: [CommonServicesModule, AuthModule, DbModule],
  providers: [],
  controllers: [AppController]
})
export class AppModule {}

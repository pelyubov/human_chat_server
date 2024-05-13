import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  providers: [ChannelService],
  controllers: [ChannelController]
})
export class ChannelModule {}

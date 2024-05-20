import { ChannelManagerService } from '@Project.Managers/channel-manager.service';
import { ConsoleLogger, Controller, Get } from '@nestjs/common';

@Controller('api/chat')
export class ChatController {
  constructor(
    private readonly manager: ChannelManagerService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('ChatController initialized', 'ChatController');
  }

  @Get('channels')
  async getChannels() {}
}

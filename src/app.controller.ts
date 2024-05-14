import { CqlDbContext } from '@Project.Database/cql.db.service';
import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger, Controller, Get, HttpStatus, Res, SetMetadata } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private cqlDbContext: CqlDbContext,
    private config: ConfigService,
    private logger: ConsoleLogger
  ) {
    this.logger.log('AppController initialized', 'AppController');
  }
  @SetMetadata('skipAuth', true)
  @Get('hello')
  hello(@Res() response: Response) {
    if (!this.config.isDev) return response.sendStatus(HttpStatus.I_AM_A_TEAPOT);
    const outStr = Object.entries(this.jsonifyServices())
      .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 4)}`)
      .join('\n');
    return response.status(HttpStatus.OK).send(`Hello! <br><pre>${outStr}</pre>`);
  }

  jsonifyServices() {
    return {
      config: this.config.toJSON(),
      cqlDbContext: this.cqlDbContext.toJSON()
    };
  }
}

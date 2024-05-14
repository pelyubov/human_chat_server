import { CqlDbContext } from '@Project.Database/cql.db.service';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger, Controller, Get, HttpStatus, Res, SetMetadata } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private cqlDbContext: CqlDbContext,
    private gremlinDbContext: GremlinDbContext,
    private config: ConfigService,
    private logger: ConsoleLogger
  ) {
    this.logger.log('AppController initialized', 'AppController');
  }
  @SetMetadata('skipAuth', true)
  @Get('hello')
  hello(@Res() response: Response) {
    if (!this.config.isDev) return response.sendStatus(HttpStatus.I_AM_A_TEAPOT);
    return response.status(HttpStatus.OK).json(this.jsonifyServices());
  }

  jsonifyServices() {
    return {
      config: this.config.toJSON(),
      cqlDbContext: this.cqlDbContext.toJSON()
    };
  }
}

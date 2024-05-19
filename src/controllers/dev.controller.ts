import { CqlDbContext } from '@Project.Database/cql.db.service';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import { ConfigService } from '@Project.Services/config.service';
import { ConsoleLogger, Controller, Get, HttpStatus, Post, Res, SetMetadata } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class DevController {
  constructor(
    private readonly cqlDbContext: CqlDbContext,
    private readonly gremlinDbContext: GremlinDbContext,
    private readonly config: ConfigService,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('DevController initialized', 'DevController');
  }
  @SetMetadata('skipAuth', true)
  @Get('/dev/status')
  async hello(@Res() response: Response) {
    if (!this.config.isDev) return response.sendStatus(HttpStatus.NOT_FOUND);
    return response.status(HttpStatus.OK).json(await this.jsonifyServices());
  }

  @SetMetadata('skipAuth', true)
  @Post('/dev/reloaddb')
  async reloadDb(@Res() response: Response) {
    // TODO: Selectively reload databases
    if (!this.config.isDev) return response.sendStatus(HttpStatus.NOT_FOUND);
    const errors: string[][] = [];
    try {
      await this.cqlDbContext.restartConnection(true);
    } catch (e) {
      errors.push(['CqlDbContext', e.toString()]);
    }
    try {
      await this.gremlinDbContext.restartConnection(true);
    } catch (e) {
      errors.push(['GremlinDbContext', e.toString()]);
    }
    const hasErrors = errors.length > 0;
    const code = hasErrors ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.OK;
    return response.status(code).json({
      message: hasErrors
        ? 'At least one database service has failed to reload. Consult the error below for more details.'
        : 'All database services have reloaded successfully.',
      errors: hasErrors ? Object.fromEntries(errors) : null
    });
  }

  async jsonifyServices() {
    return {
      config: this.config.toJSON(),
      cqlDbContext: await this.cqlDbContext.toJSON(),
      gremlinDbContext: this.gremlinDbContext.toJSON()
    };
  }
}

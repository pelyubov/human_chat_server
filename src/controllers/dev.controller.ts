import { CqlDbContext } from '@Project.Database/cql.db.service';
import { GremlinDbContext } from '@Project.Database/gremlin.db.service';
import { ConfigService } from '@Project.Services/config.service';
import {
  ConsoleLogger,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  SetMetadata
} from '@nestjs/common';

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
  async status() {
    if (!this.config.isDev) throw new NotFoundException();
    return await this.jsonifyServices();
  }

  @SetMetadata('skipAuth', true)
  @Post('/dev/reload-db-clients')
  async reloadDb() {
    // TODO: Selectively reload databases
    if (!this.config.isDev) throw new NotFoundException();
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
    if (errors.length) {
      throw new InternalServerErrorException({
        message:
          'At least one database service has failed to reload. Consult the `errors` field below for more details.',
        errors: Object.fromEntries(errors)
      });
    }
    return {
      message: 'All database services have reloaded successfully.'
    };
  }

  async jsonifyServices() {
    return {
      config: this.config.toJSON(),
      cqlDbContext: await this.cqlDbContext.toJSON(),
      gremlinDbContext: this.gremlinDbContext.toJSON()
    };
  }
}

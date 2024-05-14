import { ConsoleLogger, Injectable } from '@nestjs/common';
import { GremlinConnection } from './graph/gremlin.db';
import { ConfigService } from '@Project.Services/config.service';

@Injectable()
export class GremlinDbContext {
  constructor(
    private readonly connection: GremlinConnection,
    private readonly logger: ConsoleLogger,
    private readonly config: ConfigService
  ) {
    null;
  }
}

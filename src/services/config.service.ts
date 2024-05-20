// /* eslint-disable prettier/prettier */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import cassandraConfig from '@Project.Configs/cassandra';
import gremlinConfig from '@Project.Configs/gremlin';
import { getenv } from '@Project.Utils/helpers';
import { Jsonable } from '@Project.Utils/types';

@Injectable()
export class ConfigService implements Jsonable {
  private _nodeEnv = getenv('NODE_ENV', 'production');
  private _cassandraConfig = cassandraConfig();
  private _gremlinConfig = gremlinConfig();
  private _workerId = parseInt(getenv('WORKER_ID'));
  private _jwtSecret = getenv('JWT_SECRET');

  get nodeEnv() {
    return this._nodeEnv;
  }

  get cassandraConfig() {
    return this._cassandraConfig;
  }

  get gremlinConfig() {
    return this._gremlinConfig;
  }

  get isDev() {
    return this._nodeEnv === 'development';
  }

  get workerId() {
    return this._workerId;
  }

  get jwtSecret() {
    return this._jwtSecret;
  }

  constructor(private readonly logger: ConsoleLogger) {
    delete process.env.JWT_SECRET;
    this.logger.log('ConfigService initialized', 'ConfigService');
  }

  refresh() {
    this._cassandraConfig = cassandraConfig();
    this._gremlinConfig = gremlinConfig();
  }

  allConfig() {
    return {
      nodeEnv: this._nodeEnv,
      workerId: this._workerId,
      cassandraConfig: this._cassandraConfig,
      gremlinConfig: this._gremlinConfig
    };
  }

  toJSON() {
    return this.allConfig();
  }
}

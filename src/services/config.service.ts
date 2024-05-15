/* eslint-disable prettier/prettier */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import cassandraConfig from '@Project.Configs/cassandra';
import gremlinConfig from '@Project.Configs/gremlin';
import { Jsonable } from '@Project.Utils/common';
import { getenv } from '@Project.Utils/helpers';

@Injectable()
export class ConfigService implements Jsonable {
  private _nodeEnv = getenv('NODE_ENV', 'production');
  private _cassandraConfig = cassandraConfig();
  private _gremlinConfig = gremlinConfig();
  private _workerId = parseInt(getenv('WORKER_ID'))

  public get nodeEnv() {
    return this._nodeEnv;
  }

  public get cassandraConfig() {
    return this._cassandraConfig;
  }

  public get gremlinConfig() {
    return this._gremlinConfig;
  }

  public get isDev() {
    return this._nodeEnv === 'development';
  }

  public get workerId() {
    return this._workerId;
  }

  constructor(private logger: ConsoleLogger) {
    this.logger.log('ConfigService initialized', 'ConfigService');
  }

  public refresh() {
    this._cassandraConfig = cassandraConfig();
    this._gremlinConfig = gremlinConfig();
  }

  public allConfig() {
    return {
      nodeEnv: this._nodeEnv,
      workerId: this._workerId,
      cassandraConfig: this._cassandraConfig,
      gremlinConfig: this._gremlinConfig
    }
  }

  toJSON() {
    return this.allConfig();
  }
}

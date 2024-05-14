/* eslint-disable prettier/prettier */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { env } from 'process';
import cassandraConfig from '@Project.Configs/cassandra';
import gremlinConfig from '@Project.Configs/gremlin';
import { Jsonable } from '@Project.Utils/common';

@Injectable()
export class ConfigService implements Jsonable {
  private _nodeEnv: string;
  private _cassandraConfig = cassandraConfig();
  private _gremlinConfig = gremlinConfig();
  constructor(private logger: ConsoleLogger) {
    this._nodeEnv = env.NODE_ENV,
    this.logger.log('ConfigService initialized', 'ConfigService');
  }

  public refresh() {
    this._cassandraConfig = cassandraConfig();
    this._gremlinConfig = gremlinConfig();
  }

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

  public allConfig() {
    return {
      nodeEnv: this._nodeEnv,
      cassandraConfig: this._cassandraConfig,
      gremlinConfig: this._gremlinConfig
    }
  }

  toJSON() {
    return this.allConfig();
  }
}

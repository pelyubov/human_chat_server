import { ConsoleLogger, Injectable } from '@nestjs/common';
import { GremlinConnection } from './graph/gremlin/connection';
import { AsyncFn, Jsonable, Long } from '@Project.Utils/types';
import { GraphTraversalSource, GremlinStatics } from './graph/gremlin/types';

@Injectable()
export class GremlinDbContext implements Jsonable {
  constructor(
    private readonly connection: GremlinConnection,
    private readonly logger: ConsoleLogger
  ) {
    this.logger.log('GremlinDbContext initialized', 'GremlinDbContext');
  }
  async restartConnection(force = false) {
    await this.connection.reconnect(force);
  }
  get g() {
    return this.connection.g;
  }
  // TODO: This method crashes when called with `Connection reset`.
  async safe(action: AsyncFn<[GraphTraversalSource]>) {
    const transaction = this.connection.g.tx();
    const g = transaction.begin();
    try {
      await action(g);
      await transaction.commit();
    } catch (e) {
      if (transaction.isOpen) {
        transaction.rollback();
      }
      this.logger.error(e, 'GremlinDbContext.safe');
    }
  }

  getEdge(fromVertId: Long, toVertId: Long, label?: string) {
    return this.g.V(fromVertId).outE(label).filter(GremlinStatics.inV().hasId(toVertId));
  }

  toJSON() {
    return {
      connection: this.connection.toJSON()
    };
  }
}

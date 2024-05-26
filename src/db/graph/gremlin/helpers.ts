import { JsonParseWithBigInt } from '@Project.Utils/bigint-utils';
import { Long } from '@Project.Utils/types';
import { process as GremlinProcess, structure as GremlinStructure } from 'gremlin';
import { GraphTraversalSource } from './types';

export const GremlinStatics = GremlinProcess.statics;
export const AnonymousTraversalSource =
  GremlinProcess.AnonymousTraversalSource<GraphTraversalSource>;

const valueKey = '@value';
const typeKey = '@type';

interface TypeSerializer {
  serialize(value: any): any;
  deserialize(obj: any): any;
  canBeUsedFor(value: any): boolean;
}

export class LongSerializer implements TypeSerializer {
  serialize(value: Long | bigint) {
    const looseInt = new Number(value.toString()).valueOf();
    if (isNaN(looseInt)) {
      throw new Error('Long value appears to be NaN');
    }
    return {
      [valueKey]: value.toString(),
      [typeKey]: 'g:Int64'
    };
  }

  deserialize(obj: any) {
    const val = obj[valueKey];
    switch (typeof val) {
      case 'string':
        return Long.fromString(val);
      case 'number':
        return Long.fromNumber(val);
      case 'bigint':
        return Long.fromBigInt(val);
      default:
        throw new Error('Invalid Long value');
    }
  }

  canBeUsedFor(value: any) {
    return value instanceof Long || value instanceof BigInt || typeof value === 'bigint';
  }
}

export class GraphSON3ReaderEx extends GremlinStructure.io.GraphSONReader {
  _deserializers!: Record<string, TypeSerializer>;
  constructor() {
    super({
      serializers: {
        'g:Int64': new LongSerializer()
      }
    });
  }
  readResponse(buffer: Buffer) {
    return this.read(JsonParseWithBigInt(buffer.toString()));
  }
}

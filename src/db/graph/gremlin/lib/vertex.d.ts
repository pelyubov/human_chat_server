import type { Long } from '@Project.Utils/types';
import type { structure as GremlinStruct } from 'gremlin';

export interface Vertex2<T = any> extends GremlinStruct.Vertex {
  id: Long;
  label: string;
  properties: T; // ? Should be serialized content
}

export interface VertexProperty2<T> extends GremlinStruct.VertexProperty {
  id: unknown;
  label: string;
  value: T;
  key: string;
  properties: unknown;
}

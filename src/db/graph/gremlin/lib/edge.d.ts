import type { Long } from '@Project.Utils/types';
import { structure } from 'gremlin';

export class Edge2<T = any> extends structure.Edge {
  id: Long;
  properties: T;
}

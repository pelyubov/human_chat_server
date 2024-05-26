import { process, structure } from 'gremlin';
import { StaticSource } from './lib/types';

export const GremlinStatics = process.statics as unknown as StaticSource;
export const VertexProperty = structure.VertexProperty;

export interface GremlinConfig {
  host: string;
  port: number;
  endpoint: string;
}

export type * from './lib/types';

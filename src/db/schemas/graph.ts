import { Edge, Vertex } from '@Project.Database/graph/gremlin/types';
import { UserId } from '@Project.Utils/types';

export type UserVertex = Vertex<{
  userId: UserId;
}>;

export type ChannelVertex = Vertex<{
  channelId: string;
  name: string;
}>;

export type FriendRelationshipEdge = Edge<{
  relationshipStatus: FriendRelationshipStatus;
}>;

export enum FriendRelationshipStatus {
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  FRIEND = 'FRIEND'
}

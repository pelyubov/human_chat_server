<<<<<<<< HEAD:src/entities/channel.entity.ts
export class Channel {
========
import { UserId } from '@Project.Root/utils/types';

export class Group {
>>>>>>>> a80e4977d1efe28308ed0f03523d8f6b8c736178:src/entities/chat.entity.ts
  id: bigint;
  members: bigint[];
  name?: string;
  photo?: string;
  messages?: bigint[];
  constructor(id: bigint, members: UserId[], name?: string, photo?: string) {
    this.id = id;
    this.name = name;
    this.photo = photo;
    this.members = members;
  }
}

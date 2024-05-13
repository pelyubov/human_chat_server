import { UserId } from '@Project.Root/utils/types';

export class Group {
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

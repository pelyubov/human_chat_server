import { User } from '../../user/entities/user';

export class GroupChat {
  id: BigInt;
  name: string;
  avatar: string;
  members: User[];
  constructor(id: BigInt, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}

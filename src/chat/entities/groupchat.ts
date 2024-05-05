import User from 'src/user/user.enity';

export default class GroupChat {
  id: BigInt;
  name: string;
  photo: string;
  members: User[];
  constructor(id: BigInt, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.photo = avatar;
  }
}

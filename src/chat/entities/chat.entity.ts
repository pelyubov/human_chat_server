export class GroupChat {
  id: BigInt;
  members: BigInt[];
  name?: string;
  photo?: string;
  messages?: BigInt[];
  constructor(id: BigInt, members: BigInt[], name?: string, photo?: string) {
    this.id = id;
    this.name = name;
    this.photo = photo;
    this.members = members;
  }
}

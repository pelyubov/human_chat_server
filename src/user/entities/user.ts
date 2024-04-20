export class User {
  id: BigInt;
  name: string;
  nickname?: string;
  email: string;
  password: string;
  avatar?: string;
  status: boolean;
  isDeleted: boolean;
  constructor(
    id: BigInt,
    name: string,
    email: string,
    password: string,
    status: boolean,
    isDeleted: boolean,
    nickname?: string,
    avatar?: string,
  ) {
    this.id = id;
    this.name = name;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.avatar = avatar;
    this.status = status;
    this.isDeleted = isDeleted;
  }
}

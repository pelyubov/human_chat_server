export class LoginUser {
  id: string;
  name: string;
  email: string;
  password: string;
  status: boolean;
  isDeleted: boolean;
  friends: BigInt[];
  username?: string;
  avatar?: string;
  constructor(
    id: BigInt,
    name: string,
    email: string,
    password: string,
    status: boolean,
    isDeleted: boolean,
    friends: BigInt[],
    username?: string,
    avatar?: string,
  ) {
    this.id = id.toString();
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status;
    this.isDeleted = isDeleted;
    this.friends = friends;
    username && (this.username = username);
    avatar && (this.avatar = avatar);
  }
}

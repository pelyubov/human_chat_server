export class User {
  id: bigint;
  name: string;
  username?: string;
  email: string;
  password: string;
  avatar?: string;
  status: boolean;
  isDeleted: boolean;
  friends: bigint[];
  constructor(
    id: bigint,
    name: string,
    email: string,
    password: string,
    status: boolean,
    isDeleted: boolean,
    friends: bigint[],
    username?: string,
    avatar?: string,
  ) {
    this.id = id;
    this.name = name;
    username && (this.username = username);
    this.email = email;
    this.password = password;
    avatar && (this.avatar = avatar);
    this.status = status;
    this.isDeleted = isDeleted;
    this.friends = friends;
  }
}

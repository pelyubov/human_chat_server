export class GetUserDto {
  id: bigint;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  status: boolean;
  isDeleted: boolean;
  constructor(
    id: bigint,
    name: string,
    email: string,
    status: boolean,
    isDeleted: boolean,
    username?: string,
    avatar?: string,
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.email = email;
    this.avatar = avatar;
    this.status = status;
    this.isDeleted = isDeleted;
  }
}

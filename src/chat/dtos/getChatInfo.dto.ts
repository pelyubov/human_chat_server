class GetChatInfoDto {
  id: BigInt;
  name?: string;
  photo: string;
  constructor(id: BigInt, name?: string, photo?: string) {
    this.id = id;
    this.name = name;
    this.photo = photo;
  }
}

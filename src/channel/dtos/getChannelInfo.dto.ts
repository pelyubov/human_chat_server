class GetChannelInfoDto {
  id: bigint;
  name?: string;
  photo: string;
  constructor(id: bigint, name?: string, photo?: string) {
    this.id = id;
    this.name = name;
    this.photo = photo;
  }
}

class GetChatContentDto {
  members: BigInt[];
  messages?: BigInt[];
  constructor(members: BigInt[], messages?: BigInt[]) {
    this.members = members;
    this.messages = messages;
  }
}

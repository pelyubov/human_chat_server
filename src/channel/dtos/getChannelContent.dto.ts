class GetChannelContentDto {
  members: bigint[];
  messages?: bigint[];
  constructor(members: bigint[], messages?: bigint[]) {
    this.members = members;
    this.messages = messages;
  }
}

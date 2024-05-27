export class LongParseError extends Error {
  constructor(value: any) {
    super(`Failed to parse Long from ${value}`);
  }
}

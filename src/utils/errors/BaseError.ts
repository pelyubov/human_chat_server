export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
  toString() {
    return `${this.name}: ${this.message}`;
  }
}

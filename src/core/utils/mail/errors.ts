class EmailNotValid extends Error {
  constructor() {
    super('Email not valid');
  }
}

class EmailNotFound extends Error {
  constructor() {
    super('Email not exist');
  }
}

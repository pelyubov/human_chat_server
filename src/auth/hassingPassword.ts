import bcrypt from 'bcrypt';

export class HashingPassword {
  private static readonly saltRounds = 10;

  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, HashingPassword.saltRounds);
  }

  public static comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

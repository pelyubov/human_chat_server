import bcrypt from 'bcrypt';

export class HashingPassword {
  private static readonly saltRounds = 10;

  public static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, HashingPassword.saltRounds);
  }

  public static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

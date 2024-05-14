import { UserId } from '@Project.Root/utils/types';

export class User {
  constructor(
    public readonly id: UserId,
    public name: string,
    public email: string,
    public password: string,
    public isDeleted = false,
    public avatar?: string,
    public username?: string,
    public friends: UserId[] = [],
    public status = true
  ) {}
}

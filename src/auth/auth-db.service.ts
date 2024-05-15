import { CqlDbContext } from '@Project.Database/cql.db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthDbService {
  constructor(private readonly db: CqlDbContext) {}
  get model() {
    return this.db.model('auth');
  }
  async retrieveUser(email: string) {
    return await this.model.mapper.find({ email });
  }
}

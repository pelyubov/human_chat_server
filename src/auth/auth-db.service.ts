import { CqlDbContext } from '@Project.Database/cql.db.service';
import { ModelInstance } from '@Project.Database/cql/express-cassandra/helpers';
import { AuthModel } from '@Project.Database/cql/schemas/auth.schema';
import { SnowflakeService } from '@Project.Services/snowflake.service';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
export class AuthDbService {
  constructor(
    private readonly db: CqlDbContext,
    private snowflake: SnowflakeService
  ) {}
  get model() {
    return this.db.model('Auth') as ModelInstance<AuthModel>;
  }
  async retrieveUser(email: string) {
    // const result = await this.db.connection.client.execute(
    //   `SELECT * FROM auth WHERE email = ?`,
    //   [email],
    //   {
    //     prepare: true
    //   }
    // );
    // return result.first() as unknown as Nullable<Schema<'auth'>>;
    // return (await this.model.findOne({ email })).first();
    return await this.model.findOneAsync({ email }, { raw: true });
  }
  async createUser(email: string, password: string) {
    const credentials = await hash(password, 10);
    const id = this.snowflake.next();
    // const result = await this.model.insert({ user_id: id, email, credentials });
    const user = new this.model({ user_id: id, email, credentials });
    return await user.saveAsync();
  }
}

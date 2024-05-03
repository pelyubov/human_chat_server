import User from 'src/user/entities/user.enity';
import { IRegisterService } from 'src/user/interfaces/user.interface.service';

interface ILoginService {
  login(email: string, password: string): Promise<User>;
}

export interface IAuthService extends ILoginService, IRegisterService {}

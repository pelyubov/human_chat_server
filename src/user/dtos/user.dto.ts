import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, IsOptional } from 'class-validator';
export class UserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  avatar?: string;
  status: boolean;
}

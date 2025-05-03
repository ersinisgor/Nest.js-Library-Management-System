import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../entity/user.entity';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}

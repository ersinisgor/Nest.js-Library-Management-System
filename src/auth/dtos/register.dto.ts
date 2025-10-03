import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../../user/entity/user.entity';

export class RegisterDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  // regex for password to contain at least one uppercase, lowercase, number and special character
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  @Type(() => String)
  @Transform(({ value }) => (value as UserRole) ?? UserRole.MEMBER)
  role: UserRole = UserRole.MEMBER;
}

import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entity/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  IsDate,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { BorrowResponseDTO } from 'src/borrow/dto/borrow-response.dto';

export class UserResponseDTO {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Exclude()
  password: string;

  @Expose()
  @IsArray()
  borrows: BorrowResponseDTO[];
}

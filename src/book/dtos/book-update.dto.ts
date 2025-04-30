import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1, {
    message: 'pageCount must be greater than at least $constraint1 page.',
  })
  @IsOptional()
  pageCount?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsInt()
  @IsOptional()
  authorId: number;
}

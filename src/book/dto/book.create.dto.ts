import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateBookDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  isbn: string;

  @IsNotEmpty()
  @Min(1, {
    message: '$property must be greater than at least $constraint1 page.',
  })
  @IsInt({ message: '$property must be an integer number.' })
  pageCount: number;

  @IsBoolean()
  @IsOptional()
  isAvailable: boolean;

  @IsInt()
  @IsNotEmpty()
  authorId: number;
}

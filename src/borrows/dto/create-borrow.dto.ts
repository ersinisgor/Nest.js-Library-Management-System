import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateBorrowDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  bookId: number;
}

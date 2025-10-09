import { Expose } from 'class-transformer';
import { IsNumber, IsDate, IsObject } from 'class-validator';

export class BorrowResponseDTO {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsDate()
  borrowDate: Date;

  @Expose()
  @IsDate()
  returnDate?: Date;

  @Expose()
  @IsObject()
  user: { id: number; name: string };

  @Expose()
  @IsObject()
  book: { id: number; title: string };
}

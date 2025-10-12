import { Expose } from 'class-transformer';
import { IsNumber, IsDate, IsObject, IsArray } from 'class-validator';
import { CompactFineResponseDTO } from 'src/fine/dtos/compact-fine-response.dto';

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
  @IsDate()
  dueDate: Date;

  @Expose()
  @IsArray()
  fines: CompactFineResponseDTO[];

  @Expose()
  @IsObject()
  user: { id: number; name: string };

  @Expose()
  @IsObject()
  book: { id: number; title: string };
}

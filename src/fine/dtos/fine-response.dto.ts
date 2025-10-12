import { Expose } from 'class-transformer';
import { IsNumber, IsBoolean, IsDate, IsObject } from 'class-validator';

export class FineResponseDTO {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsObject()
  user: { id: number; name: string };

  @Expose()
  @IsObject()
  borrow: { id: number; book: { id: number; title: string } };

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsBoolean()
  isPaid: boolean;

  @Expose()
  @IsDate()
  createdAt: Date;
}

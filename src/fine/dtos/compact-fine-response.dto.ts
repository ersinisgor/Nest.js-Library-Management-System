import { Expose } from 'class-transformer';
import { IsNumber, IsBoolean } from 'class-validator';

export class CompactFineResponseDTO {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsBoolean()
  isPaid: boolean;
}

import { IsNotEmpty, IsOptional } from 'class-validator';
import { Book } from 'src/book/entity/book.entity';

export class CreateAuthorDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  biography?: string;

  @IsNotEmpty()
  books: Book[];
}

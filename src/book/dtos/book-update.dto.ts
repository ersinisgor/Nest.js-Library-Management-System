import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDTO } from './book-create.dto';

export class UpdateBookDTO extends PartialType(CreateBookDTO) {}

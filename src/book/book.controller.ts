import { Controller, Get } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entity/book.entity';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAllBooks(): Promise<Book[]> {
    return await this.bookService.getAllBooks();
  }
}

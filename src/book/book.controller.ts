import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entity/book.entity';
import { CreateBookDTO } from './dto/book.create.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAllBooks(): Promise<Book[]> {
    return await this.bookService.getAllBooks();
  }

  @Post()
  async createBook(@Body() book: CreateBookDTO): Promise<Book> {
    return await this.bookService.createBook(book);
  }
}

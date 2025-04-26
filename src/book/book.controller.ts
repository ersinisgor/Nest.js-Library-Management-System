import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entity/book.entity';
import { CreateBookDTO } from './dto/book.create.dto';
import { UpdateBookDTO } from './dto/book.update.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAllBooks(): Promise<Book[]> {
    return await this.bookService.getAllBooks();
  }

  @Get(':id')
  async getBookById(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return await this.bookService.getBookById(id);
  }

  @Post()
  async createBook(@Body() book: CreateBookDTO): Promise<Book> {
    return await this.bookService.createBook(book);
  }

  @Put(':id')
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDTO: UpdateBookDTO,
  ): Promise<Book> {
    return await this.bookService.updateBook(id, updateBookDTO);
  }

  @Delete(':id')
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.bookService.deleteBook(id);
  }
}

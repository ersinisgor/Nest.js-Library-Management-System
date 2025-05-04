import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './entity/book.entity';
import { CreateBookDTO } from './dtos/create-book.dto';
import { UpdateBookDTO } from './dtos/update-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAllBooks(): Promise<Book[]> {
    try {
      return await this.bookService.getAllBooks();
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      throw new InternalServerErrorException('Failed to retrieve books');
    }
  }

  @Get(':id')
  async getBookById(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    try {
      return await this.bookService.getBookById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getBookById:', error);
      throw new InternalServerErrorException('Failed to retrieve book');
    }
  }

  @Post()
  @HttpCode(201)
  async createBook(@Body() book: CreateBookDTO): Promise<Book> {
    try {
      return await this.bookService.createBook(book);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error in createBook:', error);
      throw new InternalServerErrorException('Failed to create book');
    }
  }

  @Put(':id')
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDTO: UpdateBookDTO,
  ): Promise<Book> {
    try {
      return await this.bookService.updateBook(id, updateBookDTO);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error in updateBook:', error);
      throw new InternalServerErrorException('Failed to update book');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.bookService.deleteBook(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in deleteBook:', error);
      throw new InternalServerErrorException('Failed to delete book');
    }
  }
}

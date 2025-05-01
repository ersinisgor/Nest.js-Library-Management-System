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
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDTO } from './dtos/create-author.dto';
import { Author } from './entity/author.entity';
import { UpdateAuthorDTO } from './dtos/update-author.dto';
import { Book } from '../book/entity/book.entity';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  async createAuthor(@Body() author: CreateAuthorDTO): Promise<Author> {
    return await this.authorService.createAuthor(author);
  }

  @Get()
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorService.getAllAuthors();
  }

  @Get(':id')
  async getAuthorById(@Param('id', ParseIntPipe) id: number): Promise<Author> {
    return await this.authorService.getAuthorById(id);
  }

  @Get(':id/books')
  async getBooksByAuthorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Book[]> {
    return await this.authorService.getBooksByAuthorId(id);
  }

  @Put(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    return await this.authorService.updateAuthor(id, updateAuthorDTO);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteAuthor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.authorService.deleteAuthor(id);
  }
}

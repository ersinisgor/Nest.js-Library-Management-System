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
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDTO } from './dtos/create-author.dto';
import { Author } from './entity/author.entity';
import { UpdateAuthorDTO } from './dtos/update-author.dto';
import { Book } from '../book/entity/book.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entity/user.entity';

@UseGuards(AuthGuard, RolesGuard)
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(201)
  async createAuthor(@Body() author: CreateAuthorDTO): Promise<Author> {
    try {
      return await this.authorService.createAuthor(author);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error in createAuthor:', error);
      throw new InternalServerErrorException('Failed to create author');
    }
  }

  @Get()
  async getAllAuthors(): Promise<Author[]> {
    try {
      return await this.authorService.getAllAuthors();
    } catch (error) {
      console.error('Error in getAllAuthors:', error);
      throw new InternalServerErrorException('Failed to retrieve authors');
    }
  }

  @Get(':id')
  async getAuthorById(@Param('id', ParseIntPipe) id: number): Promise<Author> {
    try {
      return await this.authorService.getAuthorById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getAuthorById:', error);
      throw new InternalServerErrorException('Failed to retrieve author');
    }
  }

  @Get(':id/books')
  async getBooksByAuthorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Book[]> {
    try {
      return await this.authorService.getBooksByAuthorId(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getBooksByAuthorId:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve books by author',
      );
    }
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    try {
      return await this.authorService.updateAuthor(id, updateAuthorDTO);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error in updateAuthor:', error);
      throw new InternalServerErrorException('Failed to update author');
    }
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async deleteAuthor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return await this.authorService.deleteAuthor(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in deleteAuthor:', error);
      throw new InternalServerErrorException('Failed to delete author');
    }
  }
}

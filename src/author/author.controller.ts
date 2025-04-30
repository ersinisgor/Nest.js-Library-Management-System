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
import { AuthorService } from './author.service';
import { CreateAuthorDTO } from './dtos/author-create.dto';
import { Author } from './entity/author.entity';
import { UpdateAuthorDTO } from './dtos/author-update.dto';

@Controller('author')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Post()
  async createAuthor(@Body() author: CreateAuthorDTO): Promise<Author> {
    return await this.authorService.createAuthor(author);
  }

  @Get()
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorService.getAllAuthors();
  }

  @Get(':id')
  async getAuthorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Author | null> {
    return await this.authorService.getAuthorById(id);
  }

  @Put(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    return await this.authorService.updateAuthor(id, updateAuthorDTO);
  }

  @Delete(':id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.authorService.deleteAuthor(id);
  }
}

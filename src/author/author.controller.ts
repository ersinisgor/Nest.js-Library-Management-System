import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDTO } from './dto/author-create.dto';
import { Author } from './entity/author.entity';
import { UpdateAuthorDTO } from './dto/author-update.dto';

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
  async getAuthorById(@Param(':id') id: number): Promise<Author | null> {
    return await this.authorService.getAuthorById(id);
  }

  @Put(':id')
  async updateAuthor(
    @Param(':id') id: number,
    @Body() updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    return await this.authorService.updateAuthor(id, updateAuthorDTO);
  }
}

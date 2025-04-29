import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDTO } from './dto/author-create.dto';
import { Author } from './entity/author.entity';

@Controller('author')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Post()
  async createAuthor(@Body() author: CreateAuthorDTO): Promise<Author> {
    return this.authorService.createAuthor(author);
  }

  @Get()
  async getAllAuthors(): Promise<Author[]> {
    return this.authorService.getAllAuthors();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDTO } from './dto/author-create.dto';
import { Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author) private authorRepository: Repository<Author>,
  ) {}

  async createAuthor(author: CreateAuthorDTO): Promise<Author> {
    const createdAuthor = this.authorRepository.create(author);

    return await this.authorRepository.save(createdAuthor);
  }

  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find();
  }

  async getAuthorById(id: number): Promise<Author | null> {
    const author = await this.authorRepository.findOneBy({ id });
    if (!author) {
      throw new NotFoundException(`author with ID ${id} not found`);
    }
    return author;
  }
}

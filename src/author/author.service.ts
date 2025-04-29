import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDTO } from './dto/author-create.dto';
import { Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAuthorDTO } from './dto/author-update.dto';

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
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return author;
  }

  async updateAuthor(
    id: number,
    updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    const existingAuthor = await this.authorRepository.findOneBy({ id });

    if (!existingAuthor) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    Object.assign(existingAuthor, updateAuthorDTO);

    return await this.authorRepository.save(existingAuthor);
  }

  async deleteAuthor(id: number): Promise<void> {
    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../author/entity/author.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Author) private authorRepository: Repository<Author>,
  ) {}

  async validateAuthorExists(id: number): Promise<void> {
    const author = await this.authorRepository.findOneBy({ id });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }

  async getUnknownAuthor(): Promise<Author> {
    const unknownAuthor = await this.authorRepository.findOne({
      where: { name: 'Unknown Author' },
    });
    if (!unknownAuthor) {
      throw new BadRequestException(
        'Unknown Author not found. Please create an Unknown Author first.',
      );
    }
    return unknownAuthor;
  }

  async getAuthorById(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: { books: true },
      select: { books: { id: true, title: true } },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return author;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateAuthorDTO } from './dtos/author-create.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAuthorDTO } from './dtos/author-update.dto';
import { Book } from '../book/entity/book.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author) private authorRepository: Repository<Author>,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
  ) {}

  async createAuthor(author: CreateAuthorDTO): Promise<Author> {
    try {
      const createdAuthor = this.authorRepository.create(author);
      return await this.authorRepository.save(createdAuthor);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException(
            'An Author with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({
      relations: { books: true },
      select: { books: { id: true, title: true } },
    });
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

  async updateAuthor(
    id: number,
    updateAuthorDTO: UpdateAuthorDTO,
  ): Promise<Author> {
    try {
      const existingAuthor = await this.authorRepository.findOne({
        where: { id },
        relations: { books: true },
        select: { books: { id: true, title: true } },
      });
      if (!existingAuthor) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
      Object.assign(existingAuthor, updateAuthorDTO);
      return await this.authorRepository.save(existingAuthor);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException(
            'An Author with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async deleteAuthor(id: number): Promise<void> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: { books: true },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const books = await this.bookRepository.find({ where: { author: { id } } });
    if (books.length > 0) {
      const unknownAuthor = await this.authorRepository.findOne({
        where: { name: 'Unknown Author' },
      });
      if (!unknownAuthor) {
        throw new BadRequestException(
          'Unknown Author not found. Please create an Unknown Author first.',
        );
      }
      await this.bookRepository.update(
        { author: { id } },
        { author: unknownAuthor },
      );
    }

    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthorDTO } from './dtos/create-author.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAuthorDTO } from './dtos/update-author.dto';
import { BookService } from '../book/book.service';
import { Book } from '../book/entity/book.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author) private authorRepository: Repository<Author>,
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
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
      console.error('Error creating author:', error);
      throw new InternalServerErrorException('Failed to create author');
    }
  }

  async getAllAuthors(): Promise<Author[]> {
    try {
      return await this.authorRepository.find({
        relations: { books: true },
        select: { books: { id: true, title: true } },
      });
    } catch (error) {
      console.error('Error retrieving authors:', error);
      throw new InternalServerErrorException('Failed to retrieve authors');
    }
  }

  async getAuthorById(id: number): Promise<Author> {
    try {
      const author = await this.authorRepository.findOne({
        where: { id },
        relations: { books: true },
        select: { books: { id: true, title: true } },
      });
      if (!author) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
      return author;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving author:', error);
      throw new InternalServerErrorException('Failed to retrieve author');
    }
  }

  async getBooksByAuthorId(id: number): Promise<Book[]> {
    try {
      return await this.bookService.getBooksByAuthorId(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving books by author:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve books by author',
      );
    }
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating author:', error);
      throw new InternalServerErrorException('Failed to update author');
    }
  }

  async deleteAuthor(id: number): Promise<void> {
    try {
      await this.validateAuthorExists(id);
      await this.bookService.reassignBooksToUnknownAuthor(id);
      const result = await this.authorRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting author:', error);
      throw new InternalServerErrorException('Failed to delete author');
    }
  }

  async validateAuthorExists(id: number): Promise<void> {
    try {
      const author = await this.authorRepository.findOneBy({ id });
      if (!author) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error validating author:', error);
      throw new InternalServerErrorException('Failed to validate author');
    }
  }

  async getUnknownAuthor(): Promise<Author> {
    try {
      const unknownAuthor = await this.authorRepository.findOne({
        where: { name: 'Unknown Author' },
      });
      if (!unknownAuthor) {
        throw new BadRequestException(
          'Unknown Author not found. Please create an Unknown Author first.',
        );
      }
      return unknownAuthor;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error retrieving unknown author:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve unknown author',
      );
    }
  }
}

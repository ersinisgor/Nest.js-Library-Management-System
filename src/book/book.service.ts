import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateBookDTO } from './dtos/create-book.dto';
import { UpdateBookDTO } from './dtos/update-book.dto';
import { AuthorService } from '../author/author.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    @Inject(forwardRef(() => AuthorService))
    private readonly authorService: AuthorService,
  ) {}

  async getAllBooks(): Promise<Book[]> {
    try {
      return await this.booksRepository.find({
        relations: { author: true },
        select: { author: { id: true, name: true } },
      });
    } catch (error) {
      console.error('Error retrieving books:', error);
      throw new InternalServerErrorException('Failed to retrieve books');
    }
  }

  async getBookById(id: number): Promise<Book> {
    try {
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: { author: true },
        select: { author: { id: true, name: true } },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving book:', error);
      throw new InternalServerErrorException('Failed to retrieve book');
    }
  }

  async getBooksByAuthorId(authorId: number): Promise<Book[]> {
    try {
      await this.authorService.validateAuthorExists(authorId);
      return await this.booksRepository.find({
        where: { author: { id: authorId } },
        relations: { author: true },
        select: { id: true, title: true, author: { id: true, name: true } },
      });
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

  async createBook(createBookDTO: CreateBookDTO): Promise<Book> {
    try {
      const author = await this.authorService.getAuthorById(
        createBookDTO.authorId,
      );
      const createdBook = this.booksRepository.create(createBookDTO);
      createdBook.author = author;
      return await this.booksRepository.save(createdBook);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (driverError.code === '23503') {
          throw new BadRequestException(
            `Invalid author ID: ${createBookDTO.authorId} does not exist`,
          );
        }
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error creating book:', error);
      throw new InternalServerErrorException('Failed to create book');
    }
  }

  async updateBook(id: number, updateBookDTO: UpdateBookDTO): Promise<Book> {
    try {
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: { author: true },
        select: { author: { id: true, name: true } },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      const { authorId, ...updateFields } = updateBookDTO;

      if (!authorId && Object.keys(updateFields).length === 0) {
        throw new BadRequestException(
          'At least one field must be provided for update',
        );
      }

      if (authorId) {
        const author = await this.authorService.getAuthorById(authorId);
        book.author = author;
      }

      Object.assign(book, updateFields);
      return await this.booksRepository.save(book);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (driverError.code === '23503') {
          throw new BadRequestException(
            `Invalid author ID: ${updateBookDTO.authorId} does not exist`,
          );
        }
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error updating book:', error);
      throw new InternalServerErrorException('Failed to update book');
    }
  }

  async deleteBook(id: number): Promise<void> {
    try {
      const result = await this.booksRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting book:', error);
      throw new InternalServerErrorException('Failed to delete book');
    }
  }

  async reassignBooksToUnknownAuthor(authorId: number): Promise<void> {
    try {
      const booksCount = await this.booksRepository.count({
        where: { author: { id: authorId } },
      });
      if (booksCount > 0) {
        const unknownAuthor = await this.authorService.getUnknownAuthor();
        await this.booksRepository
          .createQueryBuilder()
          .update(Book)
          .set({ author: unknownAuthor })
          .where('authorId = :id', { id: authorId })
          .execute();
      }
    } catch (error) {
      console.error('Error reassigning books:', error);
      throw new InternalServerErrorException('Failed to reassign books');
    }
  }
}

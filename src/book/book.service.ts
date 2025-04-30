import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateBookDTO } from './dtos/book-create.dto';
import { UpdateBookDTO } from './dtos/book-update.dto';
import { Author } from 'src/author/entity/author.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async getAllBooks(): Promise<Book[]> {
    return await this.booksRepository.find({ relations: { author: true } });
  }

  async getBookById(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async createBook(createBookDTO: CreateBookDTO): Promise<Book> {
    try {
      const id = createBookDTO.authorId;
      const author = await this.authorRepository.findOneBy({ id });
      if (!author) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }
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
      throw error;
    }
  }

  async updateBook(id: number, updateBookDTO: UpdateBookDTO): Promise<Book> {
    try {
      const book = await this.booksRepository.findOne({
        where: { id },
        relations: { author: true },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      const { authorId, ...updateFields } = updateBookDTO;

      // Boş DTO kontrolü
      if (!authorId && Object.keys(updateFields).length === 0) {
        throw new BadRequestException(
          'At least one field must be provided for update',
        );
      }

      if (authorId) {
        const author = await this.authorRepository.findOne({
          where: { id: authorId },
        });
        if (!author) {
          throw new NotFoundException(`Author with ID ${authorId} not found`);
        }
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
      throw error;
    }
  }

  async deleteBook(id: number): Promise<void> {
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }
}

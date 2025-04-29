import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateBookDTO } from './dto/book.create.dto';
import { UpdateBookDTO } from './dto/book.update.dto';
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

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateBookDTO } from './dto/book.create.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async getAllBooks(): Promise<Book[]> {
    return await this.booksRepository.find();
  }

  async getBookById(id: number): Promise<Book> {
    const book = await this.booksRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async createBook(book: CreateBookDTO): Promise<Book> {
    try {
      const createdBook = this.booksRepository.create(book);
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
}

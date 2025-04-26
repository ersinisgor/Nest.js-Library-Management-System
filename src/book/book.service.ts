import { Injectable, ConflictException } from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async createBook(book: CreateBookDTO): Promise<Book> {
    try {
      const createdBook = this.booksRepository.create(book);
      return await this.booksRepository.save(createdBook);
    } catch (error: any) {
      if (error?.code === '23505') {
        // PostgreSQL unique constraint error code
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw error; // Diğer hataları yeniden fırlat
    }
  }
}

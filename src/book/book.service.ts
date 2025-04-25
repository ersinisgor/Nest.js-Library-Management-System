import { Injectable } from '@nestjs/common';
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
    const createdBook = this.booksRepository.create(book);
    return await this.booksRepository.save(createdBook);
  }
}

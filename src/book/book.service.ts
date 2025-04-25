import { Injectable } from '@nestjs/common';
import { Book } from './entity/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async getAllBooks(): Promise<Book[]> {
    return await this.booksRepository.find();
  }
}

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
import { CommonService } from 'src/common/common.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    private commonService: CommonService,
  ) {}

  async getAllBooks(): Promise<Book[]> {
    return await this.booksRepository.find({
      relations: { author: true },
      select: { author: { id: true, name: true } },
    });
  }

  async getBookById(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: { author: true },
      select: { author: { id: true, name: true } },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async getBooksByAuthorId(authorId: number): Promise<Book[]> {
    await this.commonService.validateAuthorExists(authorId);
    return await this.booksRepository.find({
      where: { author: { id: authorId } },
      select: { id: true, title: true },
    });
  }

  async createBook(createBookDTO: CreateBookDTO): Promise<Book> {
    try {
      const author = await this.commonService.getAuthorById(
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
      throw error;
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
        const author = await this.commonService.getAuthorById(authorId);
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

  async reassignBooksToUnknownAuthor(authorId: number): Promise<void> {
    const booksCount = await this.booksRepository.count({
      where: { author: { id: authorId } },
    });
    if (booksCount > 0) {
      const unknownAuthor = await this.commonService.getUnknownAuthor();
      await this.booksRepository
        .createQueryBuilder()
        .update(Book)
        .set({ author: unknownAuthor })
        .where('authorId = :id', { id: authorId })
        .execute();
    }
  }
}

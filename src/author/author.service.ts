import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateAuthorDTO } from './dtos/author-create.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Author } from './entity/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAuthorDTO } from './dtos/author-update.dto';
import { BookService } from '../book/book.service';
import { Book } from '../book/entity/book.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author) private authorRepository: Repository<Author>,
    private readonly bookService: BookService,
    private readonly commonService: CommonService,
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
    return await this.commonService.getAuthorById(id);
  }

  async getBooksByAuthorId(id: number): Promise<Book[]> {
    return await this.bookService.getBooksByAuthorId(id);
  }

  async validateAuthorExists(id: number): Promise<void> {
    await this.commonService.validateAuthorExists(id);
  }

  async getUnknownAuthor(): Promise<Author> {
    return await this.commonService.getUnknownAuthor();
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
    await this.validateAuthorExists(id);
    await this.bookService.reassignBooksToUnknownAuthor(id);
    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Borrow } from './entity/borrow.entity';
import { BookService } from 'src/book/book.service';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/entity/user.entity';
import { plainToClass } from 'class-transformer';
import { BorrowResponseDTO } from './dto/borrow-response.dto';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow) private borrowRepository: Repository<Borrow>,
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(userId: number, createBorrowDto: CreateBorrowDto) {
    try {
      const { bookId } = createBorrowDto;

      const user = await this.userService.getUserById(userId);
      const currentBorrows = await this.borrowRepository.count({
        where: { user: { id: userId }, returnDate: IsNull() },
      });
      const maxBorrows = user.role === UserRole.MEMBER ? 3 : Infinity;
      if (currentBorrows >= maxBorrows) {
        throw new BadRequestException(
          `You can borrow at most ${maxBorrows} books at a time`,
        );
      }

      const book = await this.bookService.getBookById(bookId);

      if (!book.isAvailable) {
        throw new BadRequestException('Book is not available for borrowing');
      }

      const borrow = this.borrowRepository.create({
        user,
        book,
        borrowDate: new Date(),
      });

      book.isAvailable = false;
      await this.bookService.updateBook(bookId, { isAvailable: false });

      const savedBorrow = await this.borrowRepository.save(borrow);

      const result = await this.borrowRepository.findOne({
        where: { id: savedBorrow.id },
        relations: { user: true, book: true },
        select: {
          id: true,
          borrowDate: true,
          returnDate: true,
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });

      return plainToClass(BorrowResponseDTO, result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating borrow:', error);
      throw new InternalServerErrorException('Failed to create borrow');
    }
  }

  async findAll() {
    try {
      const borrows = await this.borrowRepository.find({
        relations: { user: true, book: true },
        select: {
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });
      return borrows.map((borrow) => plainToClass(BorrowResponseDTO, borrow));
    } catch (error) {
      console.error('Error retrieving borrows:', error);
      throw new InternalServerErrorException('Failed to retrieve borrows');
    }
  }

  async findAllCurrent() {
    try {
      const borrows = await this.borrowRepository.find({
        where: { returnDate: IsNull() },
        relations: { user: true, book: true },
        select: {
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });
      return borrows.map((borrow) => plainToClass(BorrowResponseDTO, borrow));
    } catch (error) {
      console.error('Error retrieving current borrows:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve current borrows',
      );
    }
  }

  async findOne(id: number) {
    try {
      const borrow = await this.borrowRepository.findOne({
        where: { id },
        relations: { user: true, book: true },
        select: {
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });
      if (!borrow) {
        throw new NotFoundException(`Borrow with ID ${id} not found`);
      }
      return plainToClass(BorrowResponseDTO, borrow);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving borrow:', error);
      throw new InternalServerErrorException('Failed to retrieve borrow');
    }
  }

  async findHistoryByBookId(bookId: number) {
    try {
      const book = await this.bookService.getBookById(bookId);
      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found`);
      }

      const borrows = await this.borrowRepository.find({
        where: { book: { id: bookId } },
        relations: { user: true },
        select: {
          id: true,
          borrowDate: true,
          returnDate: true,
          user: { id: true, name: true },
        },
        order: { borrowDate: 'DESC' },
      });

      return borrows.map((borrow) => plainToClass(BorrowResponseDTO, borrow));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving book borrow history:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve book borrow history',
      );
    }
  }

  async update(userId: number, id: number) {
    try {
      const borrow = await this.borrowRepository.findOne({
        where: { id },
        relations: { book: true, user: true },
      });
      if (!borrow) {
        throw new NotFoundException(`Borrow with ID ${id} not found`);
      }

      if (borrow.user.id !== userId) {
        throw new ForbiddenException(
          'You can only return your own borrowed books',
        );
      }

      if (borrow.returnDate) {
        throw new BadRequestException('Book is already returned');
      }

      borrow.returnDate = new Date();
      borrow.book.isAvailable = true;

      await this.bookService.updateBook(borrow.book.id, {
        isAvailable: true,
      });

      const updatedBorrow = await this.borrowRepository.save(borrow);
      return plainToClass(BorrowResponseDTO, updatedBorrow);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error updating borrow:', error);
      throw new InternalServerErrorException('Failed to update borrow');
    }
  }

  async remove(id: number) {
    try {
      const borrow = await this.borrowRepository.findOne({ where: { id } });
      if (!borrow) {
        throw new NotFoundException(`Borrow with ID ${id} not found`);
      }
      await this.borrowRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting borrow:', error);
      throw new InternalServerErrorException('Failed to delete borrow');
    }
  }

  async getCurrentBorrowCount(userId: number) {
    try {
      await this.userService.getUserById(userId);
      const count = await this.borrowRepository.count({
        where: { user: { id: userId }, returnDate: IsNull() },
      });
      return { userId, count };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving current borrow count:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve current borrow count',
      );
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBorrowDto } from './dtos/create-borrow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { Borrow } from './entity/borrow.entity';
import { BookService } from 'src/book/book.service';
import { UserService } from 'src/user/user.service';
import { FineService } from 'src/fine/fine.service';
import { UserRole } from 'src/user/entity/user.entity';
import { plainToClass } from 'class-transformer';
import { BorrowResponseDTO } from './dtos/borrow-response.dto';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow) private borrowRepository: Repository<Borrow>,
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => FineService))
    private readonly fineService: FineService,
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

      const totalUnpaidFines =
        await this.fineService.getTotalUnpaidFines(userId);
      if (totalUnpaidFines > 10) {
        throw new ForbiddenException(
          'Cannot borrow due to unpaid fines exceeding $10',
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
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
          dueDate: true,
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });

      return plainToClass(BorrowResponseDTO, result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
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
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
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
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
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
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
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
          dueDate: true,
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

  async update(userId: number, id: number): Promise<BorrowResponseDTO> {
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

      const overdueDays = Math.max(
        0,
        Math.ceil(
          (new Date().getTime() - borrow.dueDate.getTime()) /
            (24 * 60 * 60 * 1000),
        ),
      );
      const fineAmount = overdueDays * 0.5;
      if (fineAmount > 0) {
        await this.fineService.createFine(borrow, fineAmount);
      }

      borrow.returnDate = new Date();
      borrow.book.isAvailable = true;

      await this.bookService.updateBook(borrow.book.id, {
        isAvailable: true,
      });

      const updatedBorrow = await this.borrowRepository.save(borrow);

      const result = await this.borrowRepository.findOne({
        where: { id: updatedBorrow.id },
        relations: { user: true, book: true },
        select: {
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });

      return plainToClass(BorrowResponseDTO, result);
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

  async renew(userId: number, id: number) {
    try {
      const borrow = await this.borrowRepository.findOne({
        where: { id, returnDate: IsNull() },
        relations: { book: true, user: true },
      });

      if (!borrow) {
        throw new NotFoundException(
          `Borrow with ID ${id} not found or already returned`,
        );
      }

      if (borrow.user.id !== userId) {
        throw new ForbiddenException(
          'You can only renew your own borrowed books',
        );
      }

      borrow.dueDate = new Date(
        borrow.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000,
      );

      const updatedBorrow = await this.borrowRepository.save(borrow);

      const result = await this.borrowRepository.findOne({
        where: { id: updatedBorrow.id },
        relations: { user: true, book: true },
        select: {
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
          user: { id: true, name: true },
          book: { id: true, title: true },
        },
      });

      return plainToClass(BorrowResponseDTO, result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Error renewing borrow:', error);
      throw new InternalServerErrorException('Failed to renew borrow');
    }
  }

  async findOverdue() {
    try {
      const borrows = await this.borrowRepository.find({
        where: {
          returnDate: IsNull(),
          dueDate: LessThan(new Date()),
        },
        relations: { user: true, book: true },
        select: {
          user: { id: true, name: true },
          book: { id: true, title: true },
          id: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true,
        },
      });

      return borrows.map((borrow) => plainToClass(BorrowResponseDTO, borrow));
    } catch (error) {
      console.error('Error retrieving overdue borrows:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve overdue borrows',
      );
    }
  }
}

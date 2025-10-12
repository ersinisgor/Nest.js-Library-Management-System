import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fine } from './entity/fine.entity';
import { UserService } from 'src/user/user.service';
import { Borrow } from 'src/borrow/entity/borrow.entity';
import { plainToClass } from 'class-transformer';
import { FineResponseDTO } from './dtos/fine-response.dto';

@Injectable()
export class FineService {
  constructor(
    @InjectRepository(Fine)
    private fineRepository: Repository<Fine>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createFine(borrow: Borrow, amount: number) {
    try {
      if (!borrow.user) {
        throw new BadRequestException('Borrow must be associated with a user');
      }
      const user = await this.userService.getUserById(borrow.user.id);
      if (!user) {
        throw new NotFoundException(`User with ID ${borrow.user.id} not found`);
      }

      const fine = this.fineRepository.create({
        user,
        borrow,
        amount,
        isPaid: false,
        createdAt: new Date(),
      });
      const savedFine = await this.fineRepository.save(fine);
      return plainToClass(FineResponseDTO, savedFine);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating fine:', error);
      throw new InternalServerErrorException('Failed to create fine');
    }
  }

  async getUnpaidFines(userId: number) {
    try {
      await this.userService.getUserById(userId);
      const fines = await this.fineRepository.find({
        where: { user: { id: userId }, isPaid: false },
        relations: { user: true, borrow: { book: true } },
        select: {
          id: true,
          amount: true,
          isPaid: true,
          createdAt: true,
          user: { id: true, name: true },
          borrow: { id: true, book: { id: true, title: true } },
        },
      });
      return fines.map((fine) => plainToClass(FineResponseDTO, fine));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving unpaid fines:', error);
      throw new InternalServerErrorException('Failed to retrieve unpaid fines');
    }
  }

  async getTotalUnpaidFines(userId: number) {
    try {
      await this.userService.getUserById(userId);
      const result = await this.fineRepository
        .createQueryBuilder('fine')
        .select('SUM(fine.amount)', 'total')
        .where('fine.userId = :userId AND fine.isPaid = :isPaid', {
          userId,
          isPaid: false,
        })
        .getRawOne<{ total: string | null }>();

      if (!result) {
        return 0;
      }

      return parseFloat(result.total ?? '0') || 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error calculating total unpaid fines:', error);
      throw new InternalServerErrorException(
        'Failed to calculate total unpaid fines',
      );
    }
  }

  async payFines(userId: number) {
    try {
      await this.userService.getUserById(userId);

      const unpaidFines = await this.fineRepository.find({
        where: { user: { id: userId }, isPaid: false },
      });

      if (unpaidFines.length === 0) {
        return { userId, paidAmount: 0, paidCount: 0 };
      }

      const totalPaid = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);

      await this.fineRepository.update(
        { user: { id: userId }, isPaid: false },
        { isPaid: true, paidAt: new Date() },
      );

      return { userId, paidAmount: totalPaid, paidCount: unpaidFines.length };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error paying fines:', error);
      throw new InternalServerErrorException('Failed to pay fines');
    }
  }
}

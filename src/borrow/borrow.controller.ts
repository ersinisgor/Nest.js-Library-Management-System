import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dtos/create-borrow.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/user/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/types/jwt-payload.interface';

interface AuthRequest extends Request {
  user: JwtPayload;
}

@UseGuards(AuthGuard, RolesGuard)
@Controller('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: AuthRequest,
    @Body() createBorrowDto: CreateBorrowDto,
  ) {
    try {
      const userId = req.user.sub;
      return await this.borrowService.create(userId, createBorrowDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in create:', error);
      throw new InternalServerErrorException('Failed to create borrow');
    }
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll() {
    try {
      return await this.borrowService.findAll();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to retrieve borrows');
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('current')
  async findAllCurrent() {
    try {
      return await this.borrowService.findAllCurrent();
    } catch (error) {
      console.error('Error in findAllCurrent:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve current borrows',
      );
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('overdue')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async findOverdue() {
    try {
      return await this.borrowService.findOverdue();
    } catch (error) {
      console.error('Error in findOverdue:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve overdue borrows',
      );
    }
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.borrowService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findOne:', error);
      throw new InternalServerErrorException('Failed to retrieve borrow');
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('book/:bookId')
  async findHistoryByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    try {
      return await this.borrowService.findHistoryByBookId(bookId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findHistoryByBook:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve book borrow history',
      );
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('user/:userId/current-count')
  async getCurrentBorrowCount(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return await this.borrowService.getCurrentBorrowCount(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getCurrentBorrowCount:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve current borrow count',
      );
    }
  }

  @Roles(UserRole.MEMBER)
  @Patch(':id')
  async update(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    try {
      const userId = req.user.sub;
      return await this.borrowService.update(userId, id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in update:', error);
      throw new InternalServerErrorException('Failed to update borrow');
    }
  }

  @Roles(UserRole.MEMBER)
  @Patch(':id/renew')
  async renew(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    try {
      const userId = req.user.sub;
      return await this.borrowService.renew(userId, id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Error in renew:', error);
      throw new InternalServerErrorException('Failed to renew borrow');
    }
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.borrowService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in remove:', error);
      throw new InternalServerErrorException('Failed to delete borrow');
    }
  }
}

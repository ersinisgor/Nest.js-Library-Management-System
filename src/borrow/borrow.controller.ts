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
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/user/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from 'src/guards/auth.guard';

interface AuthRequest extends Request {
  user: JwtPayload;
}

@UseGuards(AuthGuard, RolesGuard)
@Controller('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Roles(UserRole.MEMBER)
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
        error instanceof BadRequestException
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

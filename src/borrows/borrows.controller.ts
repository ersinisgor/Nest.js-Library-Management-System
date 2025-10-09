import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BorrowsService } from './borrows.service';
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
export class BorrowsController {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Roles(UserRole.MEMBER)
  @Post()
  @HttpCode(201)
  async create(
    @Req() req: AuthRequest,
    @Body() createBorrowDto: CreateBorrowDto,
  ) {
    try {
      const userId = req.user.sub;
      return await this.borrowsService.create(userId, createBorrowDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
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
      return await this.borrowsService.findAll();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to retrieve borrows');
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('current')
  async findAllCurrent() {
    try {
      return await this.borrowsService.findAllCurrent();
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
      return await this.borrowsService.findOne(id);
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
      return await this.borrowsService.findHistoryByBookId(bookId);
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
      return await this.borrowsService.update(userId, id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
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
      await this.borrowsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in remove:', error);
      throw new InternalServerErrorException('Failed to delete borrow');
    }
  }
}

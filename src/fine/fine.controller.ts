import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Post,
} from '@nestjs/common';
import { FineService } from './fine.service';
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
@Controller('fines')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Roles(UserRole.MEMBER, UserRole.ADMIN)
  @Get('user/:userId')
  async getUnpaidFines(
    @Req() req: AuthRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      if (req.user.sub !== userId && req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You can only view your own fines or must be an admin',
        );
      }
      return await this.fineService.getUnpaidFines(userId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in getUnpaidFines:', error);
      throw new InternalServerErrorException('Failed to retrieve unpaid fines');
    }
  }

  @Roles(UserRole.MEMBER, UserRole.ADMIN)
  @Get('user/:userId/total')
  async getTotalUnpaidFines(
    @Req() req: AuthRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      if (req.user.sub !== userId && req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You can only view your own total fines or must be an admin',
        );
      }
      return await this.fineService.getTotalUnpaidFines(userId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in getTotalUnpaidFines:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve total unpaid fines',
      );
    }
  }

  @Roles(UserRole.MEMBER, UserRole.ADMIN)
  @Post('pay/:userId')
  async payFines(
    @Req() req: AuthRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      if (req.user.sub !== userId && req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You can only pay your own fines or must be an admin',
        );
      }

      return await this.fineService.payFines(userId);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Error in payFines:', error);
      throw new InternalServerErrorException('Failed to pay fines');
    }
  }
}

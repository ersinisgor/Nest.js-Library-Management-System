import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { UserResponseDTO } from './dtos/user-response.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from './entity/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserResponseDTO[]> {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDTO> {
    try {
      return await this.userService.getUserById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getUserById:', error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<UserResponseDTO> {
    try {
      return await this.userService.updateUser(id, updateUserDTO);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error in updateUser:', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.userService.deleteUser(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in deleteUser:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}

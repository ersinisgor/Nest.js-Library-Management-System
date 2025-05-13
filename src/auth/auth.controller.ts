import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  ConflictException,
  Post,
  UnauthorizedException,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dtos/register.dto';
import { UserResponseDTO } from '../user/dtos/user-response.dto';
import { LoginDTO } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    try {
      return await this.authService.register(registerDTO);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error in register:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: LoginDTO): Promise<LoginResponseDto> {
    try {
      return await this.authService.login(loginDTO);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Error in login:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

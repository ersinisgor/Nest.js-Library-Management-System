import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dtos/register.dto';
import { UserResponseDTO } from '../user/dtos/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    return await this.authService.register(registerDTO);
  }
}

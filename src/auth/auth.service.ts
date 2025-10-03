import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDTO } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from '../user/dtos/user-response.dto';
import { UserRole } from '../user/entity/user.entity';
import { LoginDTO } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  iat?: Date;
  exp?: Date;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  private saltRounds: number = 10;

  async register(registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    try {
      const userExist = await this.userService.checkEmailExists(
        registerDTO.email,
      );

      if (userExist) {
        throw new ConflictException(
          `User with ${registerDTO.email} email address already exists`,
        );
      }

      if (registerDTO.role && registerDTO.role !== UserRole.MEMBER) {
        throw new BadRequestException('Users can only register as MEMBER');
      }

      const hashedPassword = await this.hashPassword(
        registerDTO.password,
        this.saltRounds,
      );

      const userData: RegisterDTO = {
        ...registerDTO,
        password: hashedPassword,
      };

      return await this.userService.createUser(userData);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error registering user:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDTO: LoginDTO): Promise<LoginResponseDto> {
    try {
      const { password, email } = loginDTO;

      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Wrong email or password');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Wrong email or password');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = await this.generateToken(payload);

      return token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error logging in:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async logout() {}

  private async hashPassword(password: string, salt: number): Promise<string> {
    try {
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  private async generateToken(payload: JwtPayload): Promise<LoginResponseDto> {
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}

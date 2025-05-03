import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { plainToClass } from 'class-transformer';
import { UserResponseDTO } from './dtos/user-response.dto';
import { AuthService } from '../auth/auth.service';
import { RegisterDTO } from '../auth/dtos/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async createUser(registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    try {
      const user = this.userRepository.create(registerDTO);
      const createdUser = await this.userRepository.save(user);
      return plainToClass(UserResponseDTO, createdUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A User with this email already exists');
        }
        if (driverError.code === '23502') {
          throw new BadRequestException('Required fields cannot be null');
        }
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.find();
    return users.map((user) => plainToClass(UserResponseDTO, user));
  }

  async getUserById(id: number): Promise<UserResponseDTO> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return plainToClass(UserResponseDTO, user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async checkIfTheEmailAddressExists(email: string): Promise<boolean> {
    const emailExist = await this.userRepository.exists({ where: { email } });
    return emailExist;
  }

  async updateUser(
    id: number,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UserResponseDTO> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      if (Object.keys(updateUserDTO).length === 0) {
        throw new BadRequestException(
          'At least one field must be provided for update',
        );
      }
      Object.assign(user, updateUserDTO);
      const updatedUser = await this.userRepository.save(user);
      return plainToClass(UserResponseDTO, updatedUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A User with this email already exists');
        }
        if (driverError.code === '23502') {
          throw new BadRequestException('Required fields cannot be null');
        }
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

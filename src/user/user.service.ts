import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/user-create.dto';
import { UpdateUserDTO } from './dtos/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDTO);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A User with this email already exists');
        }
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: number, updateUserDTO: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      Object.assign(user, updateUserDTO);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new ConflictException('A User with this email already exists');
        }
      }
      throw error;
    }
  }
}

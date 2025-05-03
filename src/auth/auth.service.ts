import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDTO } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from '../user/dtos/user-response.dto';
import { UserRole } from 'src/user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async register(registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    const userExist = await this.userService.checkIfTheEmailAddressExists(
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

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerDTO.password,
      saltOrRounds,
    );

    const userData: RegisterDTO = {
      ...registerDTO,
      password: hashedPassword,
    };

    return await this.userService.createUser(userData);
  }
}

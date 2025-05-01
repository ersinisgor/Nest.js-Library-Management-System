import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from './dtos/user-create.dto';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return await this.userService.createUser(createUserDTO);
  }
}

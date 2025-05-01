import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/user-create.dto';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UpdateUserDTO } from './dtos/user-update.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @Post()
  async createUser(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return await this.userService.createUser(createUserDTO);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return await this.userService.updateUser(id, updateUserDTO);
  }
}

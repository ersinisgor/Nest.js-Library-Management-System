import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './user-create.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

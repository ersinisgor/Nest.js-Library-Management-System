import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthorDTO } from './author-create.dto';

export class UpdateAuthorDTO extends PartialType(CreateAuthorDTO) {}

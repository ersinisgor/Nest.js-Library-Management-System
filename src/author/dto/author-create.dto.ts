import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthorDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  biography?: string;
}

import { IsOptional } from 'class-validator';

export class UpdateAuthorDTO {
  @IsOptional()
  name: string;

  @IsOptional()
  biography?: string;
}

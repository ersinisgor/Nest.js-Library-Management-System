import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  biography?: string;
}

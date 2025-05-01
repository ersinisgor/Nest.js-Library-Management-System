// src/author/author.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { DatabaseModule } from '../database/database.module';
import { BookModule } from '../book/book.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => BookModule), CommonModule],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}

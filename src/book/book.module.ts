import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}

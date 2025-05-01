import { Module, forwardRef } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { DatabaseModule } from '../database/database.module';
import { AuthorModule } from '../author/author.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthorModule)],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}

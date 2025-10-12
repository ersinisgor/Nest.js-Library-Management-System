import { Module, forwardRef } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthorModule } from 'src/author/author.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthorModule), JwtModule],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}

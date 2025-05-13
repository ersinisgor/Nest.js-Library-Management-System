import { Module, forwardRef } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { DatabaseModule } from '../database/database.module';
import { BookModule } from '../book/book.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, forwardRef(() => BookModule), JwtModule],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}

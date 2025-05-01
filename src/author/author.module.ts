import { Module, forwardRef } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { DatabaseModule } from '../database/database.module';
import { BookModule } from '../book/book.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => BookModule)],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}

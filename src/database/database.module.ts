import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../author/entity/author.entity';
import { Book } from '../book/entity/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

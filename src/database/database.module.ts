import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/author/entity/author.entity';
import { Book } from 'src/book/entity/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

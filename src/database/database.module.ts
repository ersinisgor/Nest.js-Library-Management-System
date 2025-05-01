import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../author/entity/author.entity';
import { Book } from '../book/entity/book.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, User])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

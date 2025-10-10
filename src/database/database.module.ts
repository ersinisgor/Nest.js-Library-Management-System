import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/author/entity/author.entity';
import { Book } from 'src/book/entity/book.entity';
import { User } from 'src/user/entity/user.entity';
import { Borrow } from 'src/borrow/entity/borrow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, User, Borrow])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../author/entity/author.entity';
import { Book } from '../book/entity/book.entity';
import { User } from '../user/entity/user.entity';
import { Borrow } from '../borrows/entity/borrow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, User, Borrow])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

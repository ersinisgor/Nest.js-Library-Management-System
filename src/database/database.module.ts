import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/author/entity/author.entity';
import { Book } from 'src/book/entity/book.entity';
import { User } from 'src/user/entity/user.entity';
import { Borrow } from 'src/borrow/entity/borrow.entity';
import { Fine } from 'src/fine/entity/fine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, User, Borrow, Fine])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

import { forwardRef, Module } from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { BorrowsController } from './borrows.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BookModule } from 'src/book/book.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => BookModule),
    forwardRef(() => UserModule),
    JwtModule,
  ],
  controllers: [BorrowsController],
  providers: [BorrowsService],
})
export class BorrowsModule {}

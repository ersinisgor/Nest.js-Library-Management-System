import { forwardRef, Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BookModule } from 'src/book/book.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { FineModule } from 'src/fine/fine.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => BookModule),
    forwardRef(() => UserModule),
    forwardRef(() => FineModule),
    JwtModule,
  ],
  controllers: [BorrowController],
  providers: [BorrowService],
  exports: [BorrowService],
})
export class BorrowModule {}

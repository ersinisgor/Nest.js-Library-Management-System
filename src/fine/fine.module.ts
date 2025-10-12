import { forwardRef, Module } from '@nestjs/common';
import { FineController } from './fine.controller';
import { FineService } from './fine.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { BorrowModule } from 'src/borrow/borrow.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UserModule),
    forwardRef(() => BorrowModule),
    JwtModule,
  ],
  controllers: [FineController],
  providers: [FineService],
  exports: [FineService],
})
export class FineModule {}

import { Book } from 'src/book/entity/book.entity';
import { Fine } from 'src/fine/entity/fine.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';

@Entity()
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.borrows, { nullable: false })
  user: User;

  @ManyToOne(() => Book, { nullable: false })
  book: Book;

  @Column()
  borrowDate: Date;

  @Column({ nullable: true })
  returnDate: Date;

  @Column()
  dueDate: Date;

  @OneToMany(() => Fine, (fine) => fine.borrow)
  fines: Fine[];
}

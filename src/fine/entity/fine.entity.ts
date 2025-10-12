import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Borrow } from 'src/borrow/entity/borrow.entity';

@Entity()
export class Fine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.fines)
  user: User;

  @ManyToOne(() => Borrow, (borrow) => borrow.fines, { onDelete: 'CASCADE' })
  borrow: Borrow;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt: Date;
}

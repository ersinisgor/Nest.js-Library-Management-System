// author.entity.ts
import { Book } from 'src/book/entity/book.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  biography?: string;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}

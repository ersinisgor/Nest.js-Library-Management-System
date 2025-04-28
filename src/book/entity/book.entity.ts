// book.entity.ts
import { Author } from 'src/author/entity/author.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ unique: true, nullable: false })
  isbn: string;

  @Column({ nullable: false, type: 'integer' })
  pageCount: number;

  @Column({ default: true, nullable: false })
  isAvailable: boolean;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;
}

import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RequirePart } from '../helpers/typescriptHelper';

@Entity()
export class Article {

  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  title!: string;

  @Column()
  body!: string;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt?: Date;

  @Index()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt?: Date;
}

export type ArticleCreated = RequirePart<Article, 'id' | 'createdAt'>;
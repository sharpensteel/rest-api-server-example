import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ArticleView {
  @IsInt()
  id!: number;

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsString() @IsOptional()
  createdAt!: string;

  @IsString() @IsOptional()
  updatedAt?: string;
}

const MAX_ARTICLE_BODY_SIZE = 1e5;

export class ArticleForm {
  @IsString() @MinLength(1) @MaxLength(300)
  title!: string;

  @IsString() @MinLength(1) @MaxLength(MAX_ARTICLE_BODY_SIZE)
  body!: string;
}


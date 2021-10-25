import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  Authorized,
  Body,
  Delete,
  Get,
  HeaderParam,
  JsonController,
  OnUndefined,
  Param,
  Patch,
  Post,
  QueryParams
} from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { AppLogger } from '../services/logging/AppLogger';
import { Types } from '../types';
import { ArticlePresenter } from '../presenters';
import { ErrorJsonRpcNotFound } from '../models/errors';
import { ArticleRepository } from '../repositories';
import { ArticleForm, ArticleView } from '../models/article';
import { ArticleSortBy, ArticleSortByValues } from '../repositories/ArticleRepository';
import { TypeOrmSortOrder, TypeOrmSortOrderValues } from '../helpers/typeOrm';
import { ResponseSchema } from 'routing-controllers-openapi';

class ArticleGetAllQuery {
  @IsString() @IsIn(ArticleSortByValues) @IsOptional()
  sort: ArticleSortBy = ArticleSortBy.Id;

  @IsString() @IsIn(TypeOrmSortOrderValues) @IsOptional()
  order: TypeOrmSortOrder = TypeOrmSortOrder.ASC;

  @IsInt() @Min(0) @Max(1000) @IsOptional()
  limit: number = 100;

  @IsInt() @Min(0) @IsOptional()
  offset: number = 0;
}

@injectable()
@JsonController('/article')
export class ArticleController {
  constructor(
    @inject(Types.Logger) protected logger: AppLogger,
    @inject(ArticleRepository) protected articleRepository: ArticleRepository,
    @inject(Types.ArticlePresenter) protected articlePresenter: ArticlePresenter,
  ) {
  }

  @Get('/:articleId')
  @ResponseSchema(ArticleView)
  async getArticle(@Param('articleId') articleId: number) {
    const articles = await this.articleRepository.findByIds([articleId]);
    if (!articles.length) {
      throw new ErrorJsonRpcNotFound;
    }
    return this.articlePresenter.getArticleView(articles[0]);
  }

  @Get('/')
  @ResponseSchema(ArticleView, { isArray: true })
  async getArticles(@QueryParams() query: ArticleGetAllQuery) {
    const articles = await this.articleRepository.findAll(query.limit, query.offset, query.sort, query.order);
    const views = articles.map(this.articlePresenter.getArticleView);
    return views;
  }

  @Post('/')
  @Authorized()
  @HeaderParam('Authorization', { required: true })
  @ResponseSchema(ArticleView)
  async createArticle(@Body() form: ArticleForm) {
    const article = await this.articleRepository.insert({
      title: form.title,
      body: form.body
    });
    return this.articlePresenter.getArticleView(article);
  }

  @Patch('/:articleId')
  @Authorized()
  @HeaderParam('Authorization', { required: true })
  @OnUndefined(204)
  async updateArticle(@Param('articleId') articleId: number, @Body() form: ArticleForm) {
    const articles = await this.articleRepository.findByIds([articleId]);
    if (!articles.length) {
      throw new ErrorJsonRpcNotFound;
    }
    const article = articles[0];
    await this.articleRepository.updateIfChanged(article, {
      title: form.title,
      body: form.body,
    });
  }

  @Delete('/:articleId')
  @Authorized()
  @HeaderParam('Authorization', { required: true })
  @OnUndefined(204)
  async deleteArticle(@Param('articleId') articleId: number) {
    const result = await this.articleRepository.delete(articleId);
    if (!result.affected) {
      throw new ErrorJsonRpcNotFound;
    }
  }
}



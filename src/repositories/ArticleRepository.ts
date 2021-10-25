import { inject, injectable } from 'inversify';
import { DeleteResult, EntityRepository, In } from 'typeorm';
import { Article, ArticleCreated } from '../entities/Article';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Types } from '../types';
import { GenericIdRepository } from './GenericIdRepository';
import { TypeOrmSortOrder } from '../helpers/typeOrm';
import { enumStringsGetValues } from '../helpers/typescriptHelper';

export enum ArticleSortBy {
  Id = 'id',
  Title = 'title',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}
export const ArticleSortByValues = enumStringsGetValues(ArticleSortBy);


@injectable()
@EntityRepository(Article)
export class ArticleRepository extends GenericIdRepository<Article, number> {

  constructor(
    @inject(Types.DbManager) manager: EntityManager,
  ) {
    super(manager);
  }

  async findByIds(ids: number[]): Promise<ArticleCreated[]> {
    return await this.rawFind({ where: { id: In(ids) } }) as ArticleCreated[];
  }

  async findAll(
    limit: number,
    offset: number = 0,
    sortBy: ArticleSortBy = ArticleSortBy.Id,
    sortOrder: TypeOrmSortOrder = TypeOrmSortOrder.ASC
  ): Promise<ArticleCreated[]> {
    const articles = await this.createQueryBuilder()
      .skip(offset)
      .take(limit)
      .orderBy({ [`"${sortBy}"`]: sortOrder }) // currently enum ArticleSortBy unambiguously corresponds to entity fields, so it can be used directly in SQL
      .getMany();
    return articles as ArticleCreated[];
  }

  async insert(article: Partial<Article>): Promise<Article> {
    return await this.genericInsert(article);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.rawDelete(id);
  }

  async updateIfChanged(article: Article, values: Partial<Article>): Promise<Article | null> {
    return this.genericUpdateIfChanged(article, values);
  }
}


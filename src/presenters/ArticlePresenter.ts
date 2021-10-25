import { inject, injectable } from 'inversify';
import { ArticleRepository } from '../repositories';
import { Article } from '../entities/Article';
import { ArticleView } from '../models/article';


@injectable()
export class ArticlePresenter {
  constructor(
    @inject(ArticleRepository) protected articleRepository: ArticleRepository,
  ) {
  }

  getArticleView(article: Article): ArticleView {
    const view = new ArticleView;
    view.id = article.id;
    view.title = article.title;
    view.body = article.body;
    view.createdAt = article.createdAt?.toISOString() || '';
    view.updatedAt = article.updatedAt?.toISOString();
    return view;
  }
}
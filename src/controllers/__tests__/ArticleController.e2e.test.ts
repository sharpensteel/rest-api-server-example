import supertest from 'supertest';
import { mockMainContainer, runInTransaction } from '../../init/testing';
import { createExpressApp } from '../../init/express';
import { ArticleController } from '../ArticleController';
import { ArticleRepository } from '../../repositories';
import { Container } from 'inversify';
import { ArticleForm, ArticleView } from '../../models/article';
import { waitMilliseconds } from '../../helpers/javascriptHelper';
import { AppEnvironment } from '../../environment/AppEnviroment';
import { Article } from '../../entities/Article';


const mockApp = async (func: (params: { container: Container, app: any }) => Promise<any>) => {
  const mainContainer = await mockMainContainer();
  await runInTransaction(mainContainer, true, async container => {
    const app = createExpressApp(container, [ArticleController]);
    await func({ container, app });
  });
}

const requestArticles = async (app: any, url: string) => {
  const result = await supertest(app).get(url);
  expect(result.statusCode).toEqual(200);
  return result.body as ArticleView[];
}

test('/article/ GET - default behaviour', async () => {
  await mockApp(async ({ container, app }) => {
    const articleRepo = container.get(ArticleRepository);
    const article1 = await articleRepo.insert({ title: 'title 1', body: 'body 1' });
    const article2 = await articleRepo.insert({ title: 'title 2', body: 'body 2' });

    const views = await requestArticles(app, '/article/');
    expect(views.map(v => v.id)).toEqual([article1.id, article2.id]);

    expect(views[0]).toEqual(expect.objectContaining(<ArticleView>{
      id: article1.id,
      title: article1.title,
      body: article1.body,
      createdAt: article1.createdAt!.toISOString(),
      updatedAt: article1.updatedAt!.toISOString(),
    }));
  })
});

test('/article/ GET - check sorting', async () => {
  await mockApp(async ({ container, app }) => {
    const articleRepo = container.get(ArticleRepository);
    const article1 = await articleRepo.insert({ title: 'title C', body: 'body 1' });
    await waitMilliseconds(1);
    const article2 = await articleRepo.insert({ title: 'title A', body: 'body 2' });
    await waitMilliseconds(1);
    const article3 = await articleRepo.insert({ title: 'title B', body: 'body 3' });

    {
      // reverse sort by ID
      const views = await requestArticles(app, '/article/?order=DESC');
      expect(views.map(v => v.id)).toEqual([article3.id, article2.id, article1.id]);
    }
    {
      // reverse sort by title
      const views = await requestArticles(app, '/article/?order=DESC&sort=title');
      expect(views.map(v => v.id)).toEqual([article1.id, article3.id, article2.id]);
    }

    {
      // reverse sort by createdAt
      const views = await requestArticles(app, '/article/?order=DESC&sort=createdAt');
      expect(views.map(v => v.id)).toEqual([article3.id, article2.id, article1.id]);
    }

    {
      // reverse sort by updatedAt
      const views = await requestArticles(app, '/article/?order=DESC&sort=updatedAt');
      expect(views.map(v => v.id)).toEqual([article3.id, article2.id, article1.id]);
    }
  })
});

test('/article/ GET - check paging', async () => {
  await mockApp(async ({ container, app }) => {
    const articleRepo = container.get(ArticleRepository);
    const article1 = await articleRepo.insert({ title: 'title 1', body: 'body 1' });
    const article2 = await articleRepo.insert({ title: 'title 2', body: 'body 2' });
    const article3 = await articleRepo.insert({ title: 'title 3', body: 'body 3' });

    {
      const views = await requestArticles(app, '/article/?limit=1');
      expect(views.map(v => v.id)).toEqual([article1.id]);
    }

    {
      const views = await requestArticles(app, '/article/?limit=1&offset=1');
      expect(views.map(v => v.id)).toEqual([article2.id]);
    }

    {
      const result = await supertest(app).get('/article/?limit=9999');
      expect(result.statusCode).toEqual(400);
    }

    {
      const views = await requestArticles(app, '/article/?limit=1000');
      expect(views.map(v => v.id)).toEqual([article1.id, article2.id, article3.id]);
    }
  })
});


test('/article/ POST', async () => {
  await mockApp(async ({ container, app }) => {
    const articleRepo = container.get(ArticleRepository);

    const validForm = <ArticleForm>{ title: 'the title', body: 'the body' };

    {
      // valid form, invalid auth
      const result = await supertest(app)
        .post('/article/')
        .set('Authorization', 'Basic xxxx')
        .send(validForm);
      expect(result.statusCode).toEqual(401);
    }

    {
      // valid form, no auth
      const result = await supertest(app)
        .post('/article/')
        .send(validForm);
      expect(result.statusCode).toEqual(401);
    }

    {
      // invalid form
      const result = await supertest(app)
        .post('/article/')
        .set('Authorization', AppEnvironment.config.authorizationHeader!)
        .send(<ArticleForm>{ title: 'the title' });
      expect(result.statusCode).toEqual(400);
    }

    // check that there are no changes yet 
    expect((await articleRepo.findAll(100, 0)).length).toBe(0);

    {
      // valid request
      const result = await supertest(app)
        .post('/article/')
        .set('Authorization', AppEnvironment.config.authorizationHeader!)
        .send(validForm);
      expect(result.statusCode).toEqual(200);
      const viewCreated = result.body as ArticleView;

      const articles = await articleRepo.findAll(100, 0);
      expect(articles.map(article => article.id)).toEqual([viewCreated.id]);

      expect(articles[0]).toEqual(expect.objectContaining(<Partial<Article>>{
        title: 'the title',
        body: 'the body',
      }));
    }
  });
});


test('/article/ PATCH', async () => {

  await mockApp(async ({ container, app }) => {
    const articleRepo = container.get(ArticleRepository);

    const article = await articleRepo.insert({ title: 'the title', body: 'the body' });

    const validForm = <ArticleForm>{ title: 'the title upd', body: 'the body upd' };

    {
      // valid form, invalid auth
      const result = await supertest(app)
        .patch(`/article/${article.id}`)
        .set('Authorization', 'Basic xxxx')
        .send(validForm);
      expect(result.statusCode).toEqual(401);
    }

    {
      // valid form, no auth
      const result = await supertest(app)
        .patch(`/article/${article.id}`)
        .send(validForm);
      expect(result.statusCode).toEqual(401);
    }

    {
      // invalid form
      const result = await supertest(app)
        .patch(`/article/${article.id}`)
        .set('Authorization', AppEnvironment.config.authorizationHeader!)
        .send(<ArticleForm>{ title: 'the title upd' });
      expect(result.statusCode).toEqual(400);
    }

    // check that there are no changes yet 
    const articles = await articleRepo.findAll(100);
    expect(articles.length).toBe(1);
    expect(articles[0]).toEqual(expect.objectContaining(<Partial<Article>>{
      id: article.id,
      title: article.title,
      body: article.body,
    }));

    {
      // valid request
      const result = await supertest(app)
        .patch(`/article/${article.id}`)
        .set('Authorization', AppEnvironment.config.authorizationHeader!)
        .send(validForm);
      expect(result.statusCode).toEqual(204);

      const articles = await articleRepo.findByIds([article.id]);
      expect(articles[0]).toEqual(expect.objectContaining(<Partial<Article>>{
        title: validForm.title,
        body: validForm.body,
      }));
    }
  });
});

test('/article/ DELETE', async () => {
  await mockApp(async ({ container, app }) => {
    debugger;
    const articleRepo = container.get(ArticleRepository);

    const article = await articleRepo.insert({ title: 'title', body: 'body' });
    const articleOther = await articleRepo.insert({ title: 'title other', body: 'body other' });

    {
      // invalid auth
      const result = await supertest(app).delete(`/article/${article.id}`).set('Authorization', 'Basic xxxx');
      expect(result.statusCode).toEqual(401);
    }

    {
      // no auth
      const result = await supertest(app).patch(`/article/${article.id}`);
      expect(result.statusCode).toEqual(401);
    }

    // check that there are no changes yet 
    const articles = await articleRepo.findAll(100);
    expect(articles.map(article => article.id)).toEqual([article.id, articleOther.id]);

    {
      // valid request
      const result = await supertest(app)
        .delete(`/article/${article.id}`)
        .set('Authorization', AppEnvironment.config.authorizationHeader!);
      expect(result.statusCode).toEqual(204);

      const articles = await articleRepo.findAll(100);
      expect(articles.map(article => article.id)).toEqual([articleOther.id]);
    }
  });
});


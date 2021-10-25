import { Types } from '../types';
import { Container } from 'inversify';
import { AppLogger } from '../services/logging/AppLogger';
import { AppConfig } from '../environment/AppEnviroment';
import { createConnection, EntityManager } from 'typeorm';
import { repositoriesClasses, ReposMap } from '../repositories';
import { GenericIdRepository } from '../repositories/GenericIdRepository';
import { ArticlePresenter } from '../presenters';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export async function initMainContainer(
  logger: AppLogger,
  appConfig: AppConfig,
  connectionOptions: PostgresConnectionOptions,
): Promise<Container> {
  logger.info({ message: 'initContainer()...' });

  const container = new Container();
  container.bind(Types.Logger).toConstantValue(logger);
  container.bind(Types.AppConfig).toConstantValue(appConfig);
  container.bind(Types.ArticlePresenter).to(ArticlePresenter).inSingletonScope();

  const connection = await createConnection(connectionOptions);
  container.bind<EntityManager>(Types.DbManager).toConstantValue(connection.manager);

  registerRepositoriesByManager(container);

  return container;
}

export function registerRepositoriesByManager(container: Container) {
  const reposMap: ReposMap = new Map;
  for (let repositoryClass of repositoriesClasses) {
    container.bind(repositoryClass).to(repositoryClass).inSingletonScope();
    const repository = container.get<GenericIdRepository>(repositoryClass);
    reposMap.set(repositoryClass, repository);
  }
  container.bind<ReposMap>(Types.Repos).toConstantValue(reposMap);
}

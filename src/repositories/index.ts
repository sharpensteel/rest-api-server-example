import { Class } from '../helpers/typescriptHelper';
import { GenericIdRepository } from './GenericIdRepository';
import { ArticleRepository } from './ArticleRepository';

export {
  ArticleRepository,
};

export const repositoriesClasses: Class<GenericIdRepository>[] = [
  ArticleRepository,
];

/** type of Map with all repositories for using with Container. */
export interface ReposMap extends Map<Class<GenericIdRepository>, GenericIdRepository> {
  get: <T extends GenericIdRepository>(cls: Class<T>) => T;
}

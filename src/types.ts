/**
 * Symbols for Dependency Container
 */
export const Types = {

  Logger: Symbol.for('$Logger'),

  AppConfig: Symbol.for('$AppConfig'),

  DbManager: Symbol.for('$DbManager'),

  /** Map with all repositories. (Repositories also indexed in container individually, by the class name) */
  Repos: Symbol.for('$Repos'),

  ArticlePresenter: Symbol.for('$ArticlePresenter'),
}
import {Logger as TypeormLogger} from 'typeorm';
import {QueryRunner} from 'typeorm/query-runner/QueryRunner';
import {AppLogger} from './AppLogger';
import { LogLevel } from '../../models/logging';

export class AppLoggerTypeormAdapter implements TypeormLogger{

  constructor(protected logger: AppLogger) {
  }

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.info({
      message: 'query start',
      db: {
        query,
        params: parameters?.length ? parameters : undefined,
      },
    });
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.error({
      message: `query failed! ${error}`,
      db: {
        query,
        params: parameters?.length ? parameters : undefined,
      },
    });

  }

  /**
   * Can be used to log the end of the query.
   * !!! Only for queries lasting more then 1 millisecond !!!
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.info({
      message: 'query end', db: {
        query,
        elapsedMs: time,
      },
    });
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.info({
      message: 'schema building',
      info: {details: message},
    });
  }

  /**
   * Logs events from the migration run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.info({ message: `migration`, info: {details: message}});
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log'|'info'|'warn', message: any, queryRunner?: QueryRunner) {
    const pinoLevels = <Record<'log'|'info'|'warn', LogLevel>>{
      log: 'debug',
      info: 'info',
      warn: 'warn',
    };
    const pinoLevel = pinoLevels[level] || 'warn';
    this.logger.log(pinoLevel, {message})
  }
}
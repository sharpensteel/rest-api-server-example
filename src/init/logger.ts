import Pino from 'pino';
import { AppLogger } from '../services/logging/AppLogger';

export type LogLevel = Pino.Level;

export function initLogger(level: LogLevel = 'info'): AppLogger {
  const logger = new AppLogger({ level });

  process.on('unhandledRejection', (error) => {
    const errorMessage = (error instanceof Error) ? `'${error?.message}'; stack: ${error?.stack}` : JSON.stringify(error);
    logger.error({message: `unhandledRejection: ${errorMessage}`});
  });

  process.on('uncaughtException', (error) => {
    logger.error({message: `uncaughtException: '${error?.message}'; stack: ${error?.stack}`});
  });

  logger.info({message: `info level is active`});
  logger.debug({message: `debug level is active`});
  logger.trace({message: `trace level is active`});
  return logger;
}

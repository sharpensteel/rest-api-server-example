import os from 'os';
import { default as Pino } from 'pino';
import { AppEvent } from '../../models/logging';
import ecsFormat from '@elastic/ecs-pino-format';
import { EcsFields } from 'elastic-ecs';
import { LogContext } from './LogContext';

export type LoggerOptions = Pino.LoggerOptions;

/**
 * Standardize app log messages based on popular format Elastic Common Schema (ECS).
 * */
export class AppLogger {
  protected pino: Pino.Logger;

  /**
   * @param pinoOptions options passed to Pino logger constructor
   * @param logStream  if passed, log output will be redirected to this stream
   */
  constructor(pinoOptions?: LoggerOptions, logStream?: Pino.DestinationStream) {
    this.pino = Pino(
      {
        ...pinoOptions,
        ...ecsFormat({}), // convert timestamp/pid/hostname/level to ECS fields
        //timestamp: () => `,'@timestamp':'${(new Date()).toISOString()}'`,
        base: <EcsFields>{ 'process.pid': process.pid, 'host.hostname': os.hostname() },
      },
      logStream!
    );
  }

  log(level: Pino.Level, data: AppEvent) {
    const contextData = LogContext.getData() || {};
    let info = contextData.info || data.info ? Object.assign({}, contextData.info, data.info) : undefined;
    let res: any = Object.assign({}, contextData, data);
    res.info = JSON.stringify(info);
    this.pino[level](res);
  }

  trace(data: AppEvent) {
    this.log('trace', data);
  }

  debug(data: AppEvent) {
    this.log('debug', data);
  }

  info(data: AppEvent) {
    this.log('info', data);
  }

  warn(data: AppEvent) {
    this.log('warn', data);
  }

  error(data: AppEvent) {
    this.log('error', data);
  }

  fatal(data: AppEvent) {
    this.log('fatal', data);
  }
}

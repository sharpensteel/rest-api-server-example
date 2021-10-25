import { EcsFields } from 'elastic-ecs';
import {default as Pino} from 'pino';

export type LogLevel = Pino.Level;

export interface DbEvent {
  query?: string;
  params?: any;
  elapsedMs?: number;
}

interface AppCustomFields {
  /**
   * app-specific fields:
   */
  db?: DbEvent;

  'user.id'?: string | number;

  /** custom attrs, not covered in ECS nor in AppCustomFields; will be logged as a json string */
  info?: { [p: string]: any };
}

export type AppEvent = Pick<EcsFields,
  '@timestamp'
  | 'log.level'
  | 'message'
  | 'ecs.version'
  | 'error.code'
  | 'trace.id'
  | 'process.pid'
  | 'url.full'
  | 'url.path'
  | 'client.ip'
  | 'host.hostname'
  | 'http.request.method'
  | 'http.response.status_code'> & AppCustomFields;



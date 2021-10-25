import { AppLogger, LoggerOptions } from '../AppLogger';
import { LogContext } from '../LogContext';
import { AppEvent } from '../../../models/logging';
import split from 'split2';


function createLoggerOnStream(pinoOptions?: LoggerOptions): { logger: AppLogger, events: AppEvent[] } {
  const events: AppEvent[] = [];
  const stream = split().on('data', line => {
    const event = JSON.parse(line) as AppEvent;
    events.push(event)
  });
  const logger = new AppLogger(pinoOptions, stream);
  return { logger, events };
}

const logCommonFields = {
  '@timestamp': expect.any(String),
  'host.hostname': expect.any(String),
  'process.pid': expect.any(Number),
  'log.level': 'info',
  ecs: expect.objectContaining({ version: expect.any(String) }),
};

test('AppLogger simple logging', async () => {
  const { events, logger } = createLoggerOnStream();
  await LogContext.runInContext(async () => {
    logger.info({ message: 'log message' });

    const eventNeed = { ...logCommonFields, message: 'log message' };
    expect(events[0]).toEqual(expect.objectContaining(eventNeed));
  });
});

test('AppLogger with context data', async () => {
  const { events, logger } = createLoggerOnStream();
  await LogContext.runInContext(async () => {
    const customInfo = { prop1: 1, prop2: 2 };
    LogContext.setData({ 'client.ip': '2.2.2.2', 'url.full': 'www' }, customInfo);
    logger.info({ message: 'log message' });

    const eventNeed = {
      ...logCommonFields,
      'url.full': 'www',
      'client.ip': '2.2.2.2',
      'log.level': 'info',
      message: 'log message',
      info: JSON.stringify({ prop1: 1, prop2: 2 }),
    };
    expect(events[0]).toEqual(expect.objectContaining(eventNeed));
  });
});

test('AppLogger check log levels', async () => {
  const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
  for(let level of levels){
    const { events, logger } = createLoggerOnStream({level});
    logger[level]({ message: 'log message' });

    const eventNeed = {
      'log.level': level,
      message: 'log message',
    };
    expect(events[0]).toEqual(expect.objectContaining(eventNeed));
  }
});

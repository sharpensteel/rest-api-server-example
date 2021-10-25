import 'reflect-metadata';
import 'dotenv/config';
import { initLogger } from './init/logger';
import { createExpressApp } from './init/express';
import { initMainContainer } from './init/container';
import { AppEnvironment } from './environment/AppEnviroment';
import { PostgresEnvironment } from './environment/PostgresEnvironment';
import { controllers } from './controllers';

async function main() {
  const logger = initLogger();

  const appConfig = AppEnvironment.config;
  const connectionOptions = PostgresEnvironment.getConnectionOptions(logger);
  const container = await initMainContainer(logger, appConfig, connectionOptions);

  const app = createExpressApp(container, controllers);
  app.listen(appConfig.serverPort);
  logger.info({ message: `Server is up and running at port ${appConfig.serverPort}` });
}

main().catch(err => console.error(err));
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppLoggerTypeormAdapter } from '../services/logging/AppLoggerTypeormAdapter';
import { AppLogger } from '../services/logging/AppLogger';
import { Writeable } from '../helpers/typescriptHelper';

export class PostgresEnvironment {

  public static getConnectionOptions(logger: AppLogger): PostgresConnectionOptions {
    const loggerAdapter = new AppLoggerTypeormAdapter(logger);
    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '') || 5432,
      database: process.env.POSTGRES_DATABASE || 'POSTGRES_DATABASE',
      username: process.env.POSTGRES_USERNAME || 'POSTGRES_USERNAME',
      password: process.env.POSTGRES_PASSWORD || 'POSTGRES_PASSWORD',
      synchronize: false,
      logging: true,
      logger: loggerAdapter,
      entities: [__dirname + '/../entities/*'],
      maxQueryExecutionTime: 1, // For logging end of the query. Minimum query duration to be logged: 1 millisecond
    }
  }

  /**
   *  Configuration for tests database. More info in `ormconfig.unittest.js`
   **/
  public static getUnittestConnectionOptions(logger: AppLogger): PostgresConnectionOptions {

    const config = this.getConnectionOptions(logger) as Writeable<PostgresConnectionOptions>;

    config.database = process.env.POSTGRES_UNITTEST_DATABASE || 'POSTGRES_UNITTEST_DATABASE';

    if (process.env.POSTGRES_UNITTEST_HOST)
      config.host = process.env.POSTGRES_UNITTEST_HOST;

    const unittestPort = parseInt(process.env.POSTGRES_UNITTEST_PORT || '');
    if (unittestPort) {
      config.port = unittestPort;
    }

    if (process.env.POSTGRES_UNITTEST_USERNAME)
      config.username = process.env.POSTGRES_UNITTEST_USERNAME;

    if (process.env.POSTGRES_UNITTEST_PASSWORD)
      config.password = process.env.POSTGRES_UNITTEST_PASSWORD;

    return config;
  }
}

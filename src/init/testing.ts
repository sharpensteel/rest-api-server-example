import 'reflect-metadata';
import 'dotenv/config';
import { AppEnvironment } from '../environment/AppEnviroment';
import { PostgresEnvironment } from '../environment/PostgresEnvironment';
import { initMainContainer, registerRepositoriesByManager } from './container';
import { initLogger } from './logger';
import { Container } from 'inversify';
import { EntityManager } from 'typeorm';
import { Types } from '../types';


let mockedMainContainer: Container;
export async function mockMainContainer(): Promise<Container> {
  if(!mockedMainContainer){
    const logger = initLogger();
    mockedMainContainer = await initMainContainer(logger, AppEnvironment.config, PostgresEnvironment.getUnittestConnectionOptions(logger));
  }
  return mockedMainContainer;
}

/**
 * @param parentContainer  container created by createMainContainer()
 * @param funcInTransaction  container param: child container with all repos working in transaction
 * @param rollbackOnEnd  should transaction be rolled back after funcInTransaction() is finished
 */
export async function runInTransaction(
  parentContainer: Container,
  rollbackOnEnd: boolean,
  funcInTransaction: (container: Container) => Promise<void>,
) {
  // await funcInTransaction(parentContainer); return; // disabling transaction
  const manager = parentContainer.get<EntityManager>(Types.DbManager);
  const queryRunner = manager.connection.createQueryRunner();
  await queryRunner.connect();
  // todo: implement savepoints if transaction already started https://www.npmjs.com/package/pg-transaction?activeTab=readme
  await queryRunner.startTransaction();

  const childContainer = new Container();
  childContainer.parent = parentContainer;
  childContainer.bind(Types.DbManager).toConstantValue(queryRunner.manager);
  registerRepositoriesByManager(childContainer);

  let error: any;
  try {
    await funcInTransaction(childContainer);
  } catch (e) {
    error = e;
    throw e;
  } finally {
    if (error || rollbackOnEnd) {
      await queryRunner.rollbackTransaction();
    }
    await queryRunner.release();
  }
}

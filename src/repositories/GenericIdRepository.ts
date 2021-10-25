import { DeleteResult, EntityTarget, getMetadataArgsStorage, ObjectLiteral, Repository } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { objectChangeDiff } from '../helpers/lodashHelper';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { injectable, unmanaged } from 'inversify';
import { CustomRepositoryDoesNotHaveEntityError } from 'typeorm/error/CustomRepositoryDoesNotHaveEntityError';
import { CustomRepositoryNotFoundError } from 'typeorm/error/CustomRepositoryNotFoundError';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

export type EntityWithId<KeyType> = ObjectLiteral & { id: KeyType };

/**
 *
 * Class to prevent access to the low-level TypeOrm functionality
 *
 */
@injectable()
export class GenericIdRepository<Entity extends EntityWithId<KeyType> = EntityWithId<any>, KeyType = any> {

  constructor(@unmanaged() protected manager: EntityManager) {
  }

  /** Typeorm repository, cached */
  protected _repository: Repository<Entity> | undefined;

  /**
   * based on AbstractRepository.repository() but prevents creation of repository multiply times
   * */
  private get repository(): Repository<Entity> {
    if (!this._repository) {
      const target = this.getCustomRepositoryTarget(this as any);
      if (!target)
        throw new CustomRepositoryDoesNotHaveEntityError(this.constructor);

      this._repository = this.manager.getRepository<Entity>(target);
    }
    return this._repository;
  }

  protected async rawFind(options?: FindOneOptions<Entity>): Promise<Entity[]> {
    return this.repository.find(options);
  }

  protected async rawFindAndCount(options?: FindManyOptions<Entity>): Promise<[Entity[], number]> {
    return this.repository.findAndCount(options);
  }

  protected async rawDelete(id: KeyType): Promise<DeleteResult> {
    return this.repository.delete({ id: id });
  }

  protected createQueryBuilder(alias?: string): SelectQueryBuilder<Entity> {
    return this.repository.createQueryBuilder(alias);
  }


  /**
   * Returns entity object with actual id and with values from entityValues (not from DB)
   */
  protected async genericInsert(entityValues: Partial<Entity>): Promise<Entity> {
    const entity = this.repository.create(entityValues) as Entity;
    let insertRes = await this.repository.insert(entity);
    Object.assign(entity, insertRes.identifiers[0]);
    Object.assign(entity, insertRes.generatedMaps[0]);
    return entity;
  }

  /**
   * Updates fields that are different from those in the entity.
   * If there is no changes, returns null; otherwise returns original `entity` object merged with `entityValuesNew`.
   */
  protected async genericUpdateIfChanged(entity: Entity, entityValuesNew: Partial<Entity>): Promise<Entity | null> {
    const diff = objectChangeDiff(entityValuesNew, entity, null, false, true);
    if (!Object.keys(diff).length) {
      return null;
    }
    await this.repository.update(entity.id, diff);
    Object.assign(entity, diff);
    return entity;
  }


  /**
   * copied from AbstractRepository.getCustomRepositoryTarget()
   *
   * Gets custom repository's managed entity.
   * If given custom repository does not manage any entity then undefined will be returned.
   */
  private getCustomRepositoryTarget(customRepository: any): EntityTarget<any> | undefined {
    const entityRepositoryMetadataArgs = getMetadataArgsStorage().entityRepositories.find(repository => {
      return repository.target === (customRepository instanceof Function ? customRepository : (customRepository as any).constructor);
    });
    if (!entityRepositoryMetadataArgs)
      throw new CustomRepositoryNotFoundError(customRepository);

    return entityRepositoryMetadataArgs.entity;
  }
}

import fs from 'fs';
import path from 'path';
import {
  ReadTargetDto,
  IReadTargetRepository,
} from '../../domain/use-cases/read-target';

export default class ReadTargetRepositoryImpl implements IReadTargetRepository {
  public findBySelectorId = async (
    subscriptionId: string,
    selectorId: string
  ): Promise<ReadTargetDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    // TODO should this be an external function. Probably only makes sense if db is global property
    const subscription = db.subscriptions.find(
      (subscriptionEntity: { id: string }) =>
        subscriptionEntity.id === subscriptionId
    );

    // TODO is this check necessary? Should the check happen before since we can not return a proper errror here?
    if (!subscription) return null;

    const result = subscription.targets.find(
      (targetEntity: { selectorId: string }) =>
        targetEntity.selectorId === selectorId
    );

    return result || null;
  };
}

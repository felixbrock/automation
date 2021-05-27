import fs from 'fs';
import path from 'path';
import {
  ReadSubscriptionDto,
  IReadSubscriptionRepository,
} from '../../domain/use-cases/read-subscription';

export default class ReadSubscriptionRepositoryImpl
  implements IReadSubscriptionRepository
{
  public findById = async (id: string): Promise<ReadSubscriptionDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result = db.subscriptions.find(
      (subscriptionEntity: { id: string }) => subscriptionEntity.id === id
    );

    return result || null;
  };
}

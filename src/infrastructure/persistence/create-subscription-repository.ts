import fs from 'fs';
import path from 'path';
import {
  CreateSubscriptionDto,
  ICreateSubscriptionRepository,
} from '../../domain/use-cases/create-subscription';
import { Subscription } from '../../domain/entities/reference-types';

export default class CreateSubscriptionRepositoryImpl
  implements ICreateSubscriptionRepository
{
  public findByAutomationId = async (
    automationId: string
  ): Promise<CreateSubscriptionDto | null> => {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    const result = db.subscriptions.find(
      (subscriptionEntity: { automationId: string }) =>
        subscriptionEntity.automationId === automationId
    );

    return result || null;
  };

  public async save(subscription: Subscription): Promise<void> {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    db.subscriptions.push(this.#toPersistence(subscription));

    fs.writeFileSync(path.resolve(__dirname, '../../../db.json'), JSON.stringify(db), 'utf-8');
  }

  #toPersistence = (subscription: Subscription): CreateSubscriptionDto => ({
    id: subscription.id,
    automationId: subscription.automationId,
    targets: subscription.targets,
    createdOn: subscription.createdOn,
    modifiedOn: subscription.modifiedOn,
  });
}

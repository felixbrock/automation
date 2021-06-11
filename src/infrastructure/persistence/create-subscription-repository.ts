import fs from 'fs';
import path from 'path';
import {
  CreateSubscriptionDto,
  ICreateSubscriptionRepository,
} from '../../domain/use-cases/create-subscription';
import { Subscription } from '../../domain/entities';

export default class CreateSubscriptionRepositoryImpl
  implements ICreateSubscriptionRepository
{
  public async save(subscription: Subscription): Promise<void> {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    db.subscriptions.push(this.#toPersistence(subscription));

    fs.writeFileSync(path.resolve(__dirname, '../../../db.json'), JSON.stringify(db), 'utf-8');
  }

  #toPersistence = (subscription: Subscription): CreateSubscriptionDto => ({
    id: subscription.id,
    automationName: subscription.automationName,
    targets: subscription.targets,
    createdOn: subscription.createdOn,
    modifiedOn: subscription.modifiedOn,
  });
}

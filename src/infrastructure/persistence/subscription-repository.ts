import fs from 'fs';
import path from 'path';
import { Subscription, SubscriptionProperties } from '../../domain/entities';
import ISubscriptionRepository from '../../domain/subscription/i-subscription-repository';
import { Target } from '../../domain/value-types';

interface TargetPersistence {
  selectorId: string;
  systemId: string;
}

interface SubscriptionPersistence {
  id: string;
  automationName: string;
  targets: TargetPersistence[];
  modifiedOn: number;
  alertsAccessedOn: number;
  // eslint-disable-next-line semi
}

export default class SubscriptionRepositoryImpl
  implements ISubscriptionRepository
{
  public findById = async (id: string): Promise<Subscription | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: SubscriptionPersistence = db.subscriptions.find(
      (subscriptionEntity: { id: string }) => subscriptionEntity.id === id
    );

    return this.#toEntity(this.#buildProperties(result));
  };

  public async save(subscription: Subscription): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    db.subscriptions.push(this.#toPersistence(subscription));

    fs.writeFileSync(
      path.resolve(__dirname, '../../../db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  public async update(subscription: Subscription): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    for (let i = 0; i < db.subscriptions.length; i += 1) {
      if (db.subscriptions[i].id === subscription.id) {
        db.subscriptions[i] = this.#toPersistence(subscription);
        break;
      }
    }

    fs.writeFileSync(
      path.resolve(__dirname, '../../../db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  #toEntity = (
    subscriptionProperties: SubscriptionProperties
  ): Subscription | null =>
    Subscription.create(subscriptionProperties).value || null;

  #buildProperties = (
    subscription: SubscriptionPersistence
  ): SubscriptionProperties => ({
    id: subscription.id,
    automationName: subscription.automationName,
    modifiedOn: subscription.modifiedOn,
    alertsAccessedOn: subscription.alertsAccessedOn,
    targets: subscription.targets.map((target) => {
      const targetResult = Target.create(target);
      if (targetResult.value) return targetResult.value;
      throw new Error(targetResult.error || `Creation of subscription target ${target} failed`);
    }),
  });

  #toPersistence = (subscription: Subscription): SubscriptionPersistence => ({
    id: subscription.id,
    automationName: subscription.automationName,
    modifiedOn: subscription.modifiedOn,
    alertsAccessedOn: subscription.alertsAccessedOn,
    targets: subscription.targets.map(
      (target): TargetPersistence => ({
        selectorId: target.selectorId,
        systemId: target.systemId,
      })
    ),
  });
}

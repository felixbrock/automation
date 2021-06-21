import fs from 'fs';
import path from 'path';
import { Subscription, SubscriptionProperties } from '../../domain/entities';
import ISubscriptionRepository from '../../domain/subscription/i-subscription-repository';
import { Target } from '../../domain/value-types';
import Result from '../../domain/value-types/transient-types';

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

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  };

  public async save(subscription: Subscription): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      db.subscriptions.push(this.#toPersistence(subscription));

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  public async update(subscription: Subscription): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
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

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async delete(subscriptionId: string): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const subscriptions: SubscriptionPersistence[] = db.subscriptions.filter(
        (subscriptionEntity: { id: string }) =>
          subscriptionEntity.id !== subscriptionId
      );

      if (subscriptions.length === db.subscriptions.length)
        throw new Error(
          `Subscription with id ${subscriptionId} does not exist`
        );

      db.subscriptions = subscriptions;

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }


  // eslint-disable-next-line class-methods-use-this
  public async deleteTarget(
    subscriptionId: string,
    selectorId: string
  ): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const subscription: SubscriptionPersistence = db.subscriptions.find(
        (subscriptionEntity: { id: string }) =>
          subscriptionEntity.id === subscriptionId
      );

      if (!subscription)
        throw new Error(
          `Subscription with id ${subscriptionId} does not exist`
        );

      let deletionSuccess = false;
      for (let i = 0; i < subscription.targets.length; i += 1) {
        if (subscription.targets[i].selectorId === selectorId) {
          subscription.targets.splice(i, 1);
          deletionSuccess = true;
          break;
        }
      }

      // TODO - Does file remains open? Problem??
      if (!deletionSuccess)
        throw new Error(
          `Subscription target of subscription ${subscriptionId} for selector ${selectorId} was not deleted, because it does not exist`
        );

      for (let i = 0; i < db.subscriptions.length; i += 1) {
        if (db.subscriptions[i].id === subscription.id) {
          db.subscriptions[i] = subscription;
          break;
        }
      }

      fs.writeFileSync(
        path.resolve(__dirname, '../../../db.json'),
        JSON.stringify(db),
        'utf-8'
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
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
      throw new Error(
        targetResult.error || `Creation of subscription target ${target} failed`
      );
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

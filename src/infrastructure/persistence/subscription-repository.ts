import fs from 'fs';
import path from 'path';
import { Subscription, SubscriptionProperties } from '../../domain/entities';
import {
  ISubscriptionRepository,
  SubscriptionQueryDto,
  TargetQueryDto,
} from '../../domain/subscription/i-subscription-repository';
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
  public async findOne(id: string): Promise<Subscription | null> {
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
  }

  public async findBy(
    subscriptionQueryDto: SubscriptionQueryDto
  ): Promise<Subscription[]> {
    if (!Object.keys(subscriptionQueryDto).length) return this.all();

    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const subscriptions: SubscriptionPersistence[] = db.subscriptions.filter(
      (subscriptionEntity: SubscriptionPersistence) => this.findByCallback(subscriptionEntity, subscriptionQueryDto)
    );

    if (!subscriptions || !!subscriptions.length) return [];
    return subscriptions.map((subscription: SubscriptionPersistence) =>
      this.#toEntity(this.#buildProperties(subscription))
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private findByCallback(subscriptionEntity: SubscriptionPersistence, subscriptionQueryDto: SubscriptionQueryDto) : boolean{
    const automationNameMatch = subscriptionQueryDto.automationName ? subscriptionEntity.automationName === subscriptionQueryDto.automationName : true;
    const alertsAccessedOnMatch = subscriptionQueryDto.alertsAccessedOn ? subscriptionEntity.alertsAccessedOn === subscriptionQueryDto.alertsAccessedOn : true;
    const modifiedOnMatch = subscriptionQueryDto.modifiedOn ? subscriptionEntity.modifiedOn === subscriptionQueryDto.modifiedOn : true;

    let targetMatch : boolean;
    if(subscriptionQueryDto.target === true){
      const queryTarget : TargetQueryDto = subscriptionQueryDto.target;
      const result : TargetPersistence | undefined = subscriptionEntity.targets.find((target : TargetPersistence) => {
        const targetSelectorMatch = queryTarget.selectorId ? target.selectorId === queryTarget.selectorId : true;
        const targetSystemMatch = queryTarget.systemId ? target.systemId === queryTarget.systemId: true;
        return targetSelectorMatch && targetSystemMatch;
      });
      targetMatch = !!result;
    }
    else targetMatch = true;
    
    return automationNameMatch && alertsAccessedOnMatch && modifiedOnMatch && targetMatch;
  }

  public async all(): Promise<Subscription[]> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const { subscriptions } = db;

    if (!subscriptions || !!subscriptions.length) return [];
    return subscriptions.map((subscription: SubscriptionPersistence) =>
      this.#toEntity(this.#buildProperties(subscription))
    );
  }

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
  public async delete(id: string): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const subscriptions: SubscriptionPersistence[] = db.subscriptions.filter(
        (subscriptionEntity: { id: string }) => subscriptionEntity.id !== id
      );

      if (subscriptions.length === db.subscriptions.length)
        throw new Error(`Subscription with id ${id} does not exist`);

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
  ): Subscription => {
    const createSubscriptionResult: Result<Subscription> = Subscription.create(
      subscriptionProperties
    );

    if (createSubscriptionResult.error)
      throw new Error(createSubscriptionResult.error);
    if (!createSubscriptionResult.value)
      throw new Error('Subscription creation failed');

    return createSubscriptionResult.value;
  };

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

import fs from 'fs';
import path from 'path';
import {
  Automation,
  AutomationProperties,
} from '../../domain/entities/automation';
import {
  IAutomationRepository,
  AutomationQueryDto,
  SubscriptionQueryDto,
} from '../../domain/automation/i-automation-repository';
import { Subscription } from '../../domain/value-types/subscription';
import Result from '../../domain/value-types/transient-types/result';

interface SubscriptionPersistence {
  selectorId: string;
  systemId: string;
  alertsAccessedOn: number;
  alertsAccessedOnByUser: number;
}

interface AutomationPersistence {
  id: string;
  name: string;
  accountId: string;
  subscriptions: SubscriptionPersistence[];
  modifiedOn: number;
}

export default class AutomationRepositoryImpl
  implements IAutomationRepository
{
  public async findOne(id: string): Promise<Automation | null> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const result: AutomationPersistence = db.automations.find(
      (automationEntity: { id: string }) => automationEntity.id === id
    );

    if (!result) return null;
    return this.#toEntity(this.#buildProperties(result));
  }

  public async findBy(
    automationQueryDto: AutomationQueryDto
  ): Promise<Automation[]> {
    if (!Object.keys(automationQueryDto).length) return this.all();

    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const automations: AutomationPersistence[] = db.automations.filter(
      (automationEntity: AutomationPersistence) =>
        this.findByCallback(automationEntity, automationQueryDto)
    );

    if (!automations || !automations.length) return [];
    return automations.map((automation: AutomationPersistence) =>
      this.#toEntity(this.#buildProperties(automation))
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private findByCallback(
    automationEntity: AutomationPersistence,
    automationQueryDto: AutomationQueryDto
  ): boolean {
    const nameMatch = automationQueryDto.name
      ? automationEntity.name ===
        automationQueryDto.name
      : true;
    const accountIdMatch = automationQueryDto.accountId
      ? automationEntity.accountId === automationQueryDto.accountId
      : true;
    const modifiedOnStartMatch = automationQueryDto.modifiedOnStart
      ? automationEntity.modifiedOn >= automationQueryDto.modifiedOnStart
      : true;
    const modifiedOnEndMatch = automationQueryDto.modifiedOnEnd
      ? automationEntity.modifiedOn <= automationQueryDto.modifiedOnEnd
      : true;

    let subscriptionMatch: boolean;
    if (automationQueryDto.subscription) {
      const querySubscription: SubscriptionQueryDto = automationQueryDto.subscription;
      const result: SubscriptionPersistence | undefined =
        automationEntity.subscriptions.find((subscription: SubscriptionPersistence) => {
          const subscriptionSelectorMatch = querySubscription.selectorId
            ? subscription.selectorId === querySubscription.selectorId
            : true;
          const subscriptionSystemMatch = querySubscription.systemId
            ? subscription.systemId === querySubscription.systemId
            : true;
          const alertsAccessedOnStartMatch = querySubscription.alertsAccessedOnStart
            ? subscription.alertsAccessedOn >= querySubscription.alertsAccessedOnStart
            : true;
          const alertsAccessedOnEndMatch = querySubscription.alertsAccessedOnEnd
            ? subscription.alertsAccessedOn <= querySubscription.alertsAccessedOnEnd
            : true;
          const alertsAccessedOnByUserStartMatch =
            querySubscription.alertsAccessedOnByUserStart
              ? subscription.alertsAccessedOnByUser >=
                querySubscription.alertsAccessedOnByUserStart
              : true;
          const alertsAccessedOnByUserEndMatch =
            querySubscription.alertsAccessedOnByUserEnd
              ? subscription.alertsAccessedOnByUser <=
                querySubscription.alertsAccessedOnByUserEnd
              : true;
          return (
            subscriptionSelectorMatch &&
            subscriptionSystemMatch &&
            alertsAccessedOnStartMatch &&
            alertsAccessedOnEndMatch &&
            alertsAccessedOnByUserStartMatch &&
            alertsAccessedOnByUserEndMatch
          );
        });
      subscriptionMatch = !!result;
    } else subscriptionMatch = true;

    return (
      nameMatch &&
      accountIdMatch &&
      modifiedOnStartMatch &&
      modifiedOnEndMatch &&
      subscriptionMatch
    );
  }

  public async all(): Promise<Automation[]> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    const { automations } = db;

    if (!automations || !automations.length) return [];
    return automations.map((automation: AutomationPersistence) =>
      this.#toEntity(this.#buildProperties(automation))
    );
  }

  public async save(automation: Automation): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      db.automations.push(this.#toPersistence(automation));

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

  public async update(automation: Automation): Promise<Result<null>> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      for (let i = 0; i < db.automations.length; i += 1) {
        if (db.automations[i].id === automation.id) {
          db.automations[i] = this.#toPersistence(automation);
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
      const automations: AutomationPersistence[] = db.automations.filter(
        (automationEntity: { id: string }) => automationEntity.id !== id
      );

      if (automations.length === db.automations.length)
        throw new Error(`Automation with id ${id} does not exist`);

      db.automations = automations;

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

  public deleteSubscription = async (
    automationId: string,
    selectorId: string
  ): Promise<Result<null>> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    try {
      const automation: AutomationPersistence = db.automations.find(
        (automationEntity: { id: string }) =>
          automationEntity.id === automationId
      );

      if (!automation)
        throw new Error(
          `Automation with id ${automationId} does not exist`
        );

      let deletionSuccess = false;
      for (let i = 0; i < automation.subscriptions.length; i += 1) {
        if (automation.subscriptions[i].selectorId === selectorId) {
          automation.subscriptions.splice(i, 1);
          deletionSuccess = true;
          break;
        }
      }

      // TODO - Does file remains open? Problem??
      if (!deletionSuccess)
        throw new Error(
          `Automation subscription of automation ${automationId} for selector ${selectorId} was not deleted, because it does not exist`
        );

      for (let i = 0; i < db.automations.length; i += 1) {
        if (db.automations[i].id === automation.id) {
          db.automations[i] = automation;
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
  };

  #toEntity = (
    automationProperties: AutomationProperties
  ): Automation => {
    const createAutomationResult: Result<Automation> = Automation.create(
      automationProperties
    );

    if (createAutomationResult.error)
      throw new Error(createAutomationResult.error);
    if (!createAutomationResult.value)
      throw new Error('Automation creation failed');

    return createAutomationResult.value;
  };

  #buildProperties = (
    automation: AutomationPersistence
  ): AutomationProperties => ({
    id: automation.id,
    name: automation.name,
    accountId: automation.accountId,
    modifiedOn: automation.modifiedOn,
    subscriptions: automation.subscriptions.map((subscription) => {
      const subscriptionResult = Subscription.create(subscription);
      if (subscriptionResult.value) return subscriptionResult.value;
      throw new Error(
        subscriptionResult.error || `Creation of automation subscription failed`
      );
    }),
  });

  #toPersistence = (automation: Automation): AutomationPersistence => ({
    id: automation.id,
    name: automation.name,
    accountId: automation.accountId,
    modifiedOn: automation.modifiedOn,
    subscriptions: automation.subscriptions.map(
      (subscription): SubscriptionPersistence => ({
        selectorId: subscription.selectorId,
        systemId: subscription.systemId,
        alertsAccessedOn: subscription.alertsAccessedOn,
        alertsAccessedOnByUser: subscription.alertsAccessedOnByUser,
      })
    ),
  });
}

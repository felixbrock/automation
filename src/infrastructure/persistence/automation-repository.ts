import {
  DeleteResult,
  Document,
  FindCursor,
  InsertOneResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import sanitize from 'mongo-sanitize';
import {
  Automation,
  AutomationProperties,
} from '../../domain/entities/automation';
import {
  IAutomationRepository,
  AutomationQueryDto,
  AutomationUpdateDto,
} from '../../domain/automation/i-automation-repository';
import { Subscription } from '../../domain/value-types/subscription';
import { close, connect, createClient } from './db/mongo-db';

interface SubscriptionPersistence {
  selectorId: string;
  systemId: string;
  alertsAccessedOn: number;
  alertsAccessedOnByUser: number;
  modifiedOn: number;
}

interface AutomationPersistence {
  _id: string;
  name: string;
  accountId: string;
  organizationId: string;
  subscriptions: SubscriptionPersistence[];
  modifiedOn: number;
}

interface SubscriptionsQueryFilter {
  selectorId?: string;
  systemId?: string;
  alertsAccessedOn?: { [key: string]: number };
  alertsAccessedOnByUser?: { [key: string]: number };
}

interface AutomationQueryFilter {
  name?: string;
  accountId?: string;
  organizationId?: string;
  modifiedOn?: { [key: string]: number };
  subscriptions?: SubscriptionsQueryFilter;
}

interface AutomationUpdateFilter {
  $set: { [key: string]: any };
  $push: { [key: string]: any };
}

const collectionName = 'automations';

export default class AutomationRepositoryImpl implements IAutomationRepository {
  public findOne = async (id: string): Promise<Automation | null> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: any = await db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      close(client);

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    automationQueryDto: AutomationQueryDto
  ): Promise<Automation[]> => {
    try {
      if (!Object.keys(automationQueryDto).length) return await this.all();

      const client = createClient();
      const db = await connect(client);
      const result: FindCursor = await db
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(automationQueryDto)));
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildFilter = (
    automationQueryDto: AutomationQueryDto
  ): AutomationQueryFilter => {
    const filter: { [key: string]: any } = {};

    if (automationQueryDto.name) filter.name = automationQueryDto.name;
    if (automationQueryDto.accountId)
      filter.accountId = automationQueryDto.accountId;
    if (automationQueryDto.organizationId)
      filter.organizationId = automationQueryDto.organizationId;

    const modifiedOnFilter: { [key: string]: number } = {};
    if (automationQueryDto.modifiedOnStart)
      modifiedOnFilter.$gte = automationQueryDto.modifiedOnStart;
    if (automationQueryDto.modifiedOnEnd)
      modifiedOnFilter.$lte = automationQueryDto.modifiedOnEnd;
    if (Object.keys(modifiedOnFilter).length)
      filter.modifiedOn = modifiedOnFilter;

    if (
      !automationQueryDto.subscription ||
      !Object.keys(automationQueryDto.subscription).length
    )
      return filter;

    if (automationQueryDto.subscription.selectorId)
      filter['subscriptions.selectorId'] =
        automationQueryDto.subscription.selectorId;
    if (automationQueryDto.subscription.systemId)
      filter['subscriptions.systemId'] =
        automationQueryDto.subscription.systemId;

    const subscriptionAlertsAccessedOnFilter: { [key: string]: number } = {};
    if (automationQueryDto.subscription.alertsAccessedOnStart)
      subscriptionAlertsAccessedOnFilter.$gte =
        automationQueryDto.subscription.alertsAccessedOnStart;
    if (automationQueryDto.subscription.alertsAccessedOnEnd)
      subscriptionAlertsAccessedOnFilter.$lte =
        automationQueryDto.subscription.alertsAccessedOnEnd;
    if (Object.keys(subscriptionAlertsAccessedOnFilter).length)
      filter['subscriptions.alertsAccessedOn'] =
        subscriptionAlertsAccessedOnFilter;

    const subscriptionAlertsAccessedOnByUserFilter: { [key: string]: number } =
      {};
    if (automationQueryDto.subscription.alertsAccessedOnByUserStart)
      subscriptionAlertsAccessedOnByUserFilter.$gte =
        automationQueryDto.subscription.alertsAccessedOnByUserStart;
    if (automationQueryDto.subscription.alertsAccessedOnByUserEnd)
      subscriptionAlertsAccessedOnByUserFilter.$lte =
        automationQueryDto.subscription.alertsAccessedOnByUserEnd;
    if (Object.keys(subscriptionAlertsAccessedOnByUserFilter).length)
      filter['subscriptions.alertsAccessedOnByUser'] =
        subscriptionAlertsAccessedOnByUserFilter;

    return filter;
  };

  public all = async (): Promise<Automation[]> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: FindCursor = await db.collection(collectionName).find();
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public insertOne = async (account: Automation): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(account)));

      if (!result.acknowledged)
        throw new Error('Automation creation failed. Insert not acknowledged');

      close(client);

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public updateOne = async (
    id: string,
    updateDto: AutomationUpdateDto
  ): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);

      const sanitizedId = sanitize(id);
      const sanitizedUpdateDto = sanitize(updateDto);

      if (sanitizedUpdateDto.subscriptions)
        await Promise.all(
          sanitizedUpdateDto.subscriptions.map(async (subscription) =>
            this.deleteSubscription(sanitizedId, subscription.selectorId)
          )
        );

      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(sanitizedId) },
          this.#buildUpdateFilter(sanitizedUpdateDto),
          { arrayFilters: [] }
        );

      if (!result.acknowledged)
        throw new Error('Automation update failed. Update not acknowledged');

      close(client);

      return result.upsertedId;
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildUpdateFilter = (
    selectorUpdateDto: AutomationUpdateDto
  ): AutomationUpdateFilter => {
    const setFilter: { [key: string]: any } = {};
    const push: { [key: string]: any } = {};

    if (selectorUpdateDto.name) setFilter.name = selectorUpdateDto.name;
    if (selectorUpdateDto.accountId)
      setFilter.accountId = selectorUpdateDto.accountId;
    if (selectorUpdateDto.organizationId)
      setFilter.organizationId = selectorUpdateDto.organizationId;
    if (selectorUpdateDto.modifiedOn)
      setFilter.modifiedOn = selectorUpdateDto.modifiedOn;
    if (
      selectorUpdateDto.subscriptions &&
      selectorUpdateDto.subscriptions.length
    )
      push.subscriptions = {
        $each: selectorUpdateDto.subscriptions.map((subscription) =>
          this.#subscriptionToPersistence(subscription)
        ),
      };

    return { $set: setFilter, $push: push };
  };

  public deleteOne = async (id: string): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: DeleteResult = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(sanitize(id)) });

      if (!result.acknowledged)
        throw new Error('Automation delete failed. Delete not acknowledged');

      close(client);

      return result.deletedCount.toString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public deleteSubscription = async (
    automationId: string,
    selectorId: string
  ): Promise<string> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: Document | UpdateResult = await db
        .collection(collectionName)
        .updateOne(
          { _id: new ObjectId(sanitize(automationId)) },
          { $pull: { subscriptions: { selectorId: sanitize(selectorId) } } }
        );

      if (!result.acknowledged)
        throw new Error('Automation update failed. Update not acknowledged');

      close(client);

      return result.upsertedId;
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #toEntity = (automationProperties: AutomationProperties): Automation =>
    Automation.create(automationProperties);

  #buildProperties = (
    automation: AutomationPersistence
  ): AutomationProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: automation._id,
    name: automation.name,
    accountId: automation.accountId,
    organizationId: automation.organizationId,
    modifiedOn: automation.modifiedOn,
    subscriptions: automation.subscriptions.map((subscription) =>
      Subscription.create(subscription)
    ),
  });

  #toPersistence = (automation: Automation): Document => ({
    _id: ObjectId.createFromHexString(automation.id),
    name: automation.name,
    accountId: automation.accountId,
    organizationId: automation.organizationId,
    modifiedOn: automation.modifiedOn,
    subscriptions: automation.subscriptions.map(
      (subscription): SubscriptionPersistence =>
        this.#subscriptionToPersistence(subscription)
    ),
  });

  #subscriptionToPersistence = (
    subscription: Subscription
  ): SubscriptionPersistence => ({
    selectorId: subscription.selectorId,
    systemId: subscription.systemId,
    alertsAccessedOn: subscription.alertsAccessedOn,
    alertsAccessedOnByUser: subscription.alertsAccessedOnByUser,
    modifiedOn: subscription.modifiedOn,
  });
}

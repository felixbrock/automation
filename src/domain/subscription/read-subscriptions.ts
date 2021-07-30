import { Subscription } from '../entities/subscription';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {
  ISubscriptionRepository,
  SubscriptionQueryDto,
} from './i-subscription-repository';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';

export interface ReadSubscriptionsRequestDto {
  automationName?: string;
  accountId?: string;
  target?: {
    selectorId?: string;
    systemId?: string;
    alertsAccessedOnStart?: number;
    alertsAccessedOnEnd?: number;
    alertsAccessedOnByUserStart?: number;
    alertsAccessedOnByUserEnd?: number;
  };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export type ReadSubscriptionsResponseDto = Result<SubscriptionDto[] | null>;

export class ReadSubscriptions
  implements
    IUseCase<ReadSubscriptionsRequestDto, ReadSubscriptionsResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(
    request: ReadSubscriptionsRequestDto
  ): Promise<ReadSubscriptionsResponseDto> {
    try {
      const subscriptions: Subscription[] =
        await this.#subscriptionRepository.findBy(
          this.#buildSubscriptionQueryDto(request)
        );
      if (!subscriptions) throw new Error(`Queried subscriptions do not exist`);

      return Result.ok<SubscriptionDto[]>(
        subscriptions.map((subscription) => buildSubscriptionDto(subscription))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSubscriptionQueryDto = (
    request: ReadSubscriptionsRequestDto
  ): SubscriptionQueryDto => {
    const queryDto: SubscriptionQueryDto = {};

    if (request.automationName)
      queryDto.automationName = request.automationName;
    if (request.accountId) queryDto.accountId = request.accountId;
    if (
      request.target &&
      (request.target.selectorId ||
        request.target.systemId ||
        request.target.alertsAccessedOnStart ||
        request.target.alertsAccessedOnEnd ||
        request.target.alertsAccessedOnByUserStart ||
        request.target.alertsAccessedOnByUserEnd)
    )
      queryDto.target = request.target;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}

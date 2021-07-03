import { Subscription } from '../entities';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types';
import {
  ISubscriptionRepository,
  SubscriptionQueryDto,
} from './i-subscription-repository';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';

export interface ReadSubscriptionsRequestDto {
  automationName?: string;
  target?: {
    selectorId?: string;
    systemId?: string;
    alertsAccessedOn?: number;
  };
  modifiedOn?: number;
  alertsAccessedOn?: number;
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
    if (
      request.target &&
      (request.target.selectorId || request.target.systemId || request.target.alertsAccessedOn)
    )
      queryDto.target = request.target;
    if (request.modifiedOn) queryDto.modifiedOn = request.modifiedOn;

    return queryDto;
  };
}

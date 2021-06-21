import IUseCase from '../services/use-case';
import { Target, TargetProperties } from '../value-types';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import TargetDto from './target-dto';
import SubscriptionDto from '../subscription/subscription-dto';
import { UpdateSubscription } from '../subscription/update-subscription';
import Result from '../value-types/transient-types';
import { Subscription } from '../entities';
import ISubscriptionRepository from '../subscription/i-subscription-repository';

export interface CreateTargetRequestDto {
  subscriptionId: string;
  systemId: string;
  selectorId: string;
}

export type CreateTargetResponseDto = Result<TargetDto | null>;

export class CreateTarget
  implements IUseCase<CreateTargetRequestDto, CreateTargetResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #updateSubscription: UpdateSubscription;

  #getSelector: GetSelector;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    updateSubscription: UpdateSubscription,
    getSelector: GetSelector
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#updateSubscription = updateSubscription;
    this.#getSelector = getSelector;
  }

  public async execute(
    request: CreateTargetRequestDto
  ): Promise<CreateTargetResponseDto> {
    // TODO Is this correct to also provide the subscription id? Probably not.
    const target: Result<Target | null> = this.#createTarget(request);
    if (!target.value) return target;

    try {
      const validatedRequest = await this.validateRequest(target.value);
      if (validatedRequest.error)
        throw new Error(validatedRequest.error);

      // TODO Potential fix? Subscription is read twice. Once in create-target and once in update subscription
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findById(request.subscriptionId);
      if (!subscription)
        throw new Error(
          `Subscription with id ${request.subscriptionId} does not exist`
        );

      subscription.addTarget(target.value);

      const targetDtos : TargetDto[] = subscription.targets.map((targetElement) => this.#buildTargetDto(targetElement));

      const updateSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#updateSubscription.execute({
          id: request.subscriptionId,
          targets: targetDtos,
        });

      if (updateSubscriptionResult.error)
        throw new Error(updateSubscriptionResult.error);
      if (!updateSubscriptionResult.value)
        throw new Error(
          `Couldn't update subscription ${request.subscriptionId}`
        );

      return Result.ok<TargetDto>(this.#buildTargetDto(target.value));
    } catch (error) {
      return Result.fail<TargetDto>(error.message);
    }
  }

  private async validateRequest(target: Target): Promise<Result<null>> {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({
        id: target.selectorId,
      });

    if (getSelectorResponse.error)
      return Result.fail<null>(getSelectorResponse.error);
    if (!getSelectorResponse.value)
      return Result.fail<null>(
        `No selector was found for id ${target.selectorId}`
      );

    if (getSelectorResponse.value.systemId !== target.systemId)
      return Result.fail<null>(
        `Provided system id ${target.systemId} doesn't match the selector's system ${getSelectorResponse.value.systemId}`
      );

    return Result.ok<null>(null);
  }

  #buildTargetDto = (target: Target): TargetDto => ({
    selectorId: target.selectorId,
    systemId: target.systemId,
  });

  #createTarget = (request: CreateTargetRequestDto): Result<Target | null> => {
    const targetProperties: TargetProperties = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Target.create(targetProperties);
  };
}

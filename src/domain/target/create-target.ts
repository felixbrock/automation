import IUseCase from '../services/use-case';
import { Target, TargetProperties } from '../value-types';
import { ReadSubscription } from '../subscription/read-subscription';
import { GetSelector, GetSelectorResponseDto } from '../get-selector/get-selector';
import TargetDto from './target-dto';
import SubscriptionDto from '../subscription/subscription-dto';
import { UpdateSubscription } from '../subscription/update-subscription';
import Result from '../value-types/transient-types';

export interface CreateTargetRequestDto {
  subscriptionId: string;
  systemId: string;
  selectorId: string;
}

export type CreateTargetResponseDto = Result<TargetDto | null>;

export class CreateTarget
  implements IUseCase<CreateTargetRequestDto, CreateTargetResponseDto>
{
  #readSubscription: ReadSubscription;

  #updateSubscription: UpdateSubscription;

  #getSelector: GetSelector;

  public constructor(
    readSubscription: ReadSubscription,
    updateSubscription: UpdateSubscription,
    getSelector: GetSelector
  ) {
    this.#readSubscription = readSubscription;
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
        return Result.fail<TargetDto>(validatedRequest.error);

      // TODO Potential fix? Subscription is read twice. Once in create-target and once in update subscription
      const readSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#readSubscription.execute({ id: request.subscriptionId });

      if (readSubscriptionResult.error)
        return Result.fail<null>(readSubscriptionResult.error);
      if (!readSubscriptionResult.value)
        return Result.fail<null>(
          `Couldn't read subscription ${request.subscriptionId}`
        );

      const targetDtos = readSubscriptionResult.value.targets;
      const targetDto = this.#buildTargetDto(target.value);
      targetDtos.push(targetDto);

      const updateSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#updateSubscription.execute({
          id: request.subscriptionId,
          targets: targetDtos,
        });

      if (updateSubscriptionResult.error)
        return Result.fail<null>(updateSubscriptionResult.error);
      if (!updateSubscriptionResult.value)
        return Result.fail<null>(
          `Couldn't update subscription ${request.subscriptionId}`
        );

      return Result.ok<TargetDto>(targetDto);
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

import { IUseCase, Result } from '../shared';
import { Target, TargetProps } from '../value-types';
import {
  ReadSubscription,
  ReadSubscriptionDto,
} from './read-subscription';
import { GetSelector, GetSelectorResponseDto } from './get-selector';
import {
  ReadTarget,
  ReadTargetDto,
} from './read-target';

export interface CreateTargetRequestDto {
  subscriptionId: string;
  systemId: string;
  selectorId: string;
}

export interface CreateTargetDto {
  subscriptionId: string;
  systemId: string;
  selectorId: string;
  createdOn: number;
}

export type CreateTargetResponseDto = Result<CreateTargetDto | null>;

export interface ICreateTargetRepository {
  save(target: Target): Promise<void>;
}

export class CreateTarget
  implements IUseCase<CreateTargetRequestDto, CreateTargetResponseDto>
{
  #createTargetRepository: ICreateTargetRepository;

  #readTarget: ReadTarget;

  #readSubscription: ReadSubscription;

  #getSelector: GetSelector;

  public constructor(
    createTargetRepository: ICreateTargetRepository,
    readTarget: ReadTarget,
    readSubscription: ReadSubscription,
    getSelector: GetSelector
  ) {
    this.#createTargetRepository = createTargetRepository;
    this.#readTarget = readTarget;
    this.#readSubscription = readSubscription;
    this.#getSelector = getSelector;
  }

  public async execute(
    request: CreateTargetRequestDto
  ): Promise<CreateTargetResponseDto> {
    const target: Result<Target | null> = this.#createTarget(request);
    if (!target.value) return target;

    try {
      const validatedRequest = await this.validateRequest(target.value);
      if (validatedRequest.error)
        return Result.fail<CreateTargetDto>(validatedRequest.error);

      // TODO no error handling
      await this.#createTargetRepository.save(target.value);

      return Result.ok<CreateTargetDto>(this.#buildTargetDto(target.value));
    } catch (error) {
      return Result.fail<CreateTargetDto>(error.message);
    }
  }

  private async validateRequest(target: Target): Promise<Result<null>> {
    const readSubscriptionResult: Result<ReadSubscriptionDto | null> =
      await this.#readSubscription.execute({ id: target.subscriptionId });

    if (readSubscriptionResult.error)
      return Result.fail<null>(readSubscriptionResult.error);
    if (!readSubscriptionResult.value)
      return Result.fail<null>(
        `Couldn't read subscription ${target.subscriptionId}`
      );

    const targetSearchResult: Result<ReadTargetDto | null> =
      await this.#readTarget.execute({
        selectorId: target.selectorId,
        subscriptionId: readSubscriptionResult.value.id,
      });

    if (targetSearchResult.error)
      return Result.fail<null>(targetSearchResult.error);
    if (targetSearchResult.value)
      return Result.fail<null>(
        `Target with selector ${targetSearchResult.value.selectorId} already exists for subscription ${readSubscriptionResult.value.id}`
      );

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

    if (getSelectorResponse.value?.systemId !== target.systemId)
      return Result.fail<null>(
        `Provided system id ${target.systemId} doesn't match the selector's system ${getSelectorResponse.value.systemId}`
      );

    return Result.ok<null>(null);
  }

  #buildTargetDto = (target: Target): CreateTargetDto => ({
    subscriptionId: target.subscriptionId,
    selectorId: target.selectorId,
    systemId: target.systemId,
    createdOn: target.createdOn,
  });

  #createTarget = (request: CreateTargetRequestDto): Result<Target | null> => {
    const targetProps: TargetProps = {
      subscriptionId: request.subscriptionId,
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Target.create(targetProps);
  };
}

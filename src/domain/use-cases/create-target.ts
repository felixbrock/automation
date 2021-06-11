import { IUseCase, Result } from '../shared';
import { Target, TargetProps } from '../value-types';
import {
  IReadSubscriptionRepository,
  ReadSubscriptionDto,
} from './read-subscription';
import { GetSelector, GetSelectorResponseDto } from './get-selector';
import { IReadTargetRepository, ReadTargetDto } from './read-target';

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

  #readTargetRepository: IReadTargetRepository;

  #readSubscriptionRepository: IReadSubscriptionRepository;

  #getSelector: GetSelector;

  public constructor(
    createTargetRepository: ICreateTargetRepository,
    readTargetRepository: IReadTargetRepository,
    readSubscriptionRepository: IReadSubscriptionRepository,
    getSelector: GetSelector
  ) {
    this.#createTargetRepository = createTargetRepository;
    this.#readTargetRepository = readTargetRepository;
    this.#readSubscriptionRepository = readSubscriptionRepository;
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
    const readSubscriptionResult: ReadSubscriptionDto | null =
      await this.#readSubscriptionRepository.findById(target.subscriptionId);

    if (!readSubscriptionResult)
      return Result.fail<null>(
        `Subscription ${target.subscriptionId} does not exist`
      );

    // TODO Fix naming in all existing use cases createTargetDto is misleading
    const targetSearchResult: ReadTargetDto | null =
      await this.#readTargetRepository.findBySelectorId(
        readSubscriptionResult.id,
        target.selectorId
      );

    if (targetSearchResult)
      return Result.fail<null>(
        `Target with selector ${targetSearchResult.selectorId} already exists for subscription ${readSubscriptionResult.id}`
      );

    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({
        id: target.selectorId,
      });

    if (getSelectorResponse.error)
      return Result.fail<null>(getSelectorResponse.error);
    if (!getSelectorResponse.value)
      return Result.fail<null>(`No selector was found for id ${target.selectorId}`);

    if (getSelectorResponse.value?.systemId !== target.systemId)
      return Result.fail<null>(`Provided system id ${target.systemId} doesn't match the selector's system ${getSelectorResponse.value.systemId}`);
    
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

import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../shared';
import { Id, Result } from '../entities/value-types';
import { Subscription, SubscriptionProps, Target} from '../entities/reference-types';

export interface CreateSubscriptionRequestDto {
  automationId: string;
  systemId: string;
  selectorId: string;
}

export type CreateSubscriptionResponseDto = Result<CreateSubscriptionDto | null>;

export interface CreateSubscriptionDto {
  id: string;
  automationId: string;
  targets: Target[];
  modifiedOn: number;
  createdOn: number;
}

export interface ICreateSubscriptionRepository {
  findByAutomationId(automationId: string): Promise<CreateSubscriptionDto | null>;
  save(subscription: Subscription): Promise<void>;
}

export class CreateSubscription
  implements IUseCase<CreateSubscriptionRequestDto, CreateSubscriptionResponseDto>
{
  #createSubscriptionRepository: ICreateSubscriptionRepository;

  public constructor(createSubscriptionRepository: ICreateSubscriptionRepository) {
    this.#createSubscriptionRepository = createSubscriptionRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: CreateSubscriptionRequestDto
  ): Promise<CreateSubscriptionResponseDto> {
    const subscription: Result<Subscription | null> =
      this.#createSubscription(request);
    if (!subscription.value) return subscription;

    try {
      const createSubscriptionDto: CreateSubscriptionDto | null =
        await this.#createSubscriptionRepository.findByAutomationId(
          subscription.value.automationId
        );
      if (createSubscriptionDto)
        return Result.fail<null>(
          `Automation is already subscribed under id ${createSubscriptionDto.id}`
        );

      await this.#createSubscriptionRepository.save(subscription.value);

      return Result.ok<CreateSubscriptionDto>(
        this.#buildSubscriptionDto(subscription.value)
      );
    } catch (error) {
      return Result.fail<CreateSubscriptionDto>(error.message);
    }
  }

  #buildSubscriptionDto = (subscription: Subscription): CreateSubscriptionDto => ({
    id: subscription.id,
    automationId: subscription.automationId,
    targets: subscription.targets,
    createdOn: subscription.createdOn,
    modifiedOn: subscription.modifiedOn,
  });

  #createSubscription = (
    request: CreateSubscriptionRequestDto
  ): Result<Subscription | null> => {
    const subscriptionProps: SubscriptionProps = {
      id: Id.next(uuidv4).id,
      automationId: request.automationId,
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Subscription.create(subscriptionProps);
  };
}

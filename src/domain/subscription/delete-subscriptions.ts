import IUseCase from '../services/use-case';
import { SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation-dto';
import Result from '../value-types/transient-types/result';
import { ReadAutomations } from '../automation/read-automations';
import { DeleteSubscription } from './delete-subscription';

export interface DeleteSubscriptionsRequestDto {
  selectorId: string;
}

export interface DeleteSubscriptionsAuthDto {
  organizationId: string;
}

export type DeleteSubscriptionsResponseDto = Result<null>;

export class DeleteSubscriptions
  implements
    IUseCase<
      DeleteSubscriptionsRequestDto,
      DeleteSubscriptionsResponseDto,
      DeleteSubscriptionsAuthDto
    >
{
  #deleteSubscription: DeleteSubscription;

  #readAutomations: ReadAutomations;

  public constructor(
    readAutomations: ReadAutomations,
    deleteSubscription: DeleteSubscription
  ) {
    this.#deleteSubscription = deleteSubscription;
    this.#readAutomations = readAutomations;
  }

  public async execute(
    request: DeleteSubscriptionsRequestDto,
    auth: DeleteSubscriptionsAuthDto
  ): Promise<DeleteSubscriptionsResponseDto> {
    try {
      const readAutomationsResult: Result<AutomationDto[] | null> =
        await this.#readAutomations.execute(
          {},
          { organizationId: auth.organizationId }
        );

      if (readAutomationsResult.error)
        throw new Error(readAutomationsResult.error);
      if (!readAutomationsResult.value)
        throw new Error(`Couldn't read automations`);

      const deletionResults = await Promise.all(
        readAutomationsResult.value.map(async (automation) =>
          this.deleteSubscription(
            automation,
            request.selectorId,
            auth.organizationId
          )
        )
      );

      const failed = deletionResults.find((result) => result.error);
      if (failed)
        throw new Error(
          `Deletion of automation subscriptions referencing selector ${request.selectorId} failed. Please try again`
        );

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  private async deleteSubscription(
    automationDto: AutomationDto,
    selectorId: string,
    organizationId: string
  ): Promise<Result<null>> {
    const subscription: SubscriptionDto | undefined =
      automationDto.subscriptions.find(
        (element) => element.selectorId === selectorId
      );

    if (!subscription) return Result.ok<null>();

    return this.#deleteSubscription.execute(
      {
        automationId: automationDto.id,
        selectorId,
      },
      { organizationId }
    );
  }
}

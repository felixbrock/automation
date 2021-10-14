import IUseCase from '../services/use-case';
import { SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation-dto';
import Result from '../value-types/transient-types/result';
import { ReadAutomations } from '../automation/read-automations';
import {
  DeleteSubscription,
  DeleteSubscriptionResponseDto,
} from './delete-subscription';

export interface DeleteSubscriptionsRequestDto {
  selectorId: string;
}

export interface DeleteSubscriptionsAuthDto {
  organizationId: string;
}

export type DeleteSubscriptionsResponseDto = Result<string>;

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
      const readAutomationsResult: Result<AutomationDto[]> =
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

      return Result.ok(
        `Number of subscriptions deleted: ${deletionResults.length}`
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  private async deleteSubscription(
    automationDto: AutomationDto,
    selectorId: string,
    organizationId: string
  ): Promise<DeleteSubscriptionResponseDto> {
    const subscription: SubscriptionDto | undefined =
      automationDto.subscriptions.find(
        (element) => element.selectorId === selectorId
      );

    if (!subscription)
      return Result.ok('No subscriptions found. Deletion not necessary');

    return this.#deleteSubscription.execute(
      {
        automationId: automationDto.id,
        selectorId,
      },
      { organizationId }
    );
  }
}

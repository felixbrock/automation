// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  UpdateSubscriptions,
  UpdateSubscriptionDto,
  UpdateSubscriptionsRequestDto,
  UpdateSubscriptionsResponseDto,
} from '../../../domain/subscription/update-subscriptions';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class UpdateSubscriptionsController extends BaseController {
  #updateSubscriptions: UpdateSubscriptions;

  #getAccounts: GetAccounts;

  public constructor(
    updateSubscriptions: UpdateSubscriptions,
    getAccounts: GetAccounts
  ) {
    super();
    this.#updateSubscriptions = updateSubscriptions;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): UpdateSubscriptionsRequestDto => {
    const subscriptions: UpdateSubscriptionDto[] = [];

    httpRequest.body.subscriptions.forEach(
      (subscription: { [key: string]: any }) =>
        subscriptions.push({
          selectorId: subscription.selectorId,
          alertsAccessedOn: subscription.alertsAccessedOn || undefined,
          alertsAccessedOnByUser:
            subscription.alertsAccessedOnByUser || undefined,
        })
    );

    return {
      automationId: httpRequest.params.automationId,
      subscriptions,
    };
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: UpdateSubscriptionsRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: UpdateSubscriptionsResponseDto =
        await this.#updateSubscriptions.execute(requestDto);

      if (useCaseResult.error) {
        return UpdateSubscriptionsController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return UpdateSubscriptionsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: any) {
      return UpdateSubscriptionsController.fail(res, error);
    }
  }
}

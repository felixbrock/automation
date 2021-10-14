// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  UpdateSubscriptions,
  UpdateSubscriptionDto,
  UpdateSubscriptionsRequestDto,
  UpdateSubscriptionsResponseDto,
  UpdateSubscriptionsAuthDto,
} from '../../../domain/subscription/update-subscriptions';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

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

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): UpdateSubscriptionsAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return UpdateSubscriptionsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];     

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await UpdateSubscriptionsController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return UpdateSubscriptionsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: UpdateSubscriptionsRequestDto =
        this.#buildRequestDto(req);
      const authDto: UpdateSubscriptionsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        jwt
      );

      const useCaseResult: UpdateSubscriptionsResponseDto =
        await this.#updateSubscriptions.execute(requestDto, authDto);

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
    } catch (error: unknown) {
      if (typeof error === 'string')
        return UpdateSubscriptionsController.fail(res, error);
      if (error instanceof Error)
        return UpdateSubscriptionsController.fail(res, error);
      return UpdateSubscriptionsController.fail(res, 'Unknown error occured');
    }
  }
}

// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSubscription,
  DeleteSubscriptionAuthDto,
  DeleteSubscriptionRequestDto,
  DeleteSubscriptionResponseDto,
} from '../../../domain/subscription/delete-subscription';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteSubscriptionController extends BaseController {
  #deleteSubscription: DeleteSubscription;

  #getAccounts: GetAccounts;

  public constructor(
    deleteSubscription: DeleteSubscription,
    getAccounts: GetAccounts
  ) {
    super();
    this.#deleteSubscription = deleteSubscription;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSubscriptionRequestDto => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return {
        automationId: httpRequest.params.automationId,
        selectorId,
      };
    throw new Error(
      'request query parameter automationId is supposed to be in string format'
    );
  };

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): DeleteSubscriptionAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return DeleteSubscriptionController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSubscriptionController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSubscriptionController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: DeleteSubscriptionRequestDto =
        this.#buildRequestDto(req);

      const authDto: DeleteSubscriptionAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteSubscriptionResponseDto =
        await this.#deleteSubscription.execute(buildDtoResult, authDto);

      if (useCaseResult.error) {
        return DeleteSubscriptionController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteSubscriptionController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return DeleteSubscriptionController.fail(res, error);
      if (error instanceof Error)
        return DeleteSubscriptionController.fail(res, error);
      return DeleteSubscriptionController.fail(res, 'Unknown error occured');
    }
  }
}

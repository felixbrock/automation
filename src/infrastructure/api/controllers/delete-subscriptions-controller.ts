// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSubscriptions,
  DeleteSubscriptionsAuthDto,
  DeleteSubscriptionsRequestDto,
  DeleteSubscriptionsResponseDto,
} from '../../../domain/subscription/delete-subscriptions';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteSubscriptionsController extends BaseController {
  #deleteSubscriptions: DeleteSubscriptions;

  #getAccounts: GetAccounts;

  public constructor(
    deleteSubscriptions: DeleteSubscriptions,
    getAccounts: GetAccounts
  ) {
    super();
    this.#deleteSubscriptions = deleteSubscriptions;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSubscriptionsRequestDto => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return {
        selectorId,
      };
    throw new Error(
      'request query parameter selectorId is supposed to be in string format'
    );
  };

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): DeleteSubscriptionsAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return DeleteSubscriptionsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSubscriptionsController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSubscriptionsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: DeleteSubscriptionsRequestDto =
        this.#buildRequestDto(req);

      const authDto: DeleteSubscriptionsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteSubscriptionsResponseDto =
        await this.#deleteSubscriptions.execute(buildDtoResult, authDto);

      if (useCaseResult.error) {
        return DeleteSubscriptionsController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteSubscriptionsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return DeleteSubscriptionsController.fail(res, error);
      if (error instanceof Error)
        return DeleteSubscriptionsController.fail(res, error);
      return DeleteSubscriptionsController.fail(res, 'Unknown error occured');
    }
  }
}

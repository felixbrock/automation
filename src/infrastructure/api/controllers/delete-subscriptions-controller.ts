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

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteSubscriptionsRequestDto> => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return Result.ok<DeleteSubscriptionsRequestDto>({
        selectorId,
      });
    return Result.fail<DeleteSubscriptionsRequestDto>(
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
      const token = req.headers.authorization;

      if (!token)
        return DeleteSubscriptionsController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSubscriptionsController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSubscriptionsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<DeleteSubscriptionsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return DeleteSubscriptionsController.badRequest(
          res,
          buildDtoResult.error
        );
      if (!buildDtoResult.value)
        return DeleteSubscriptionsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const authDto: DeleteSubscriptionsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteSubscriptionsResponseDto =
        await this.#deleteSubscriptions.execute(buildDtoResult.value, authDto);

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
    } catch (error: any) {
      return DeleteSubscriptionsController.fail(res, error);
    }
  }
}

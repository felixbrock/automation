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

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteSubscriptionRequestDto> => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return Result.ok<DeleteSubscriptionRequestDto>({
        automationId: httpRequest.params.automationId,
        selectorId,
      });
    return Result.fail<DeleteSubscriptionRequestDto>(
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
      const token = req.headers.authorization;

      if (!token)
        return DeleteSubscriptionController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSubscriptionController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSubscriptionController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<DeleteSubscriptionRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return DeleteSubscriptionController.badRequest(
          res,
          buildDtoResult.error
        );
      if (!buildDtoResult.value)
        return DeleteSubscriptionController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const authDto: DeleteSubscriptionAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteSubscriptionResponseDto =
        await this.#deleteSubscription.execute(buildDtoResult.value, authDto);

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
    } catch (error: any) {
      return DeleteSubscriptionController.fail(res, error);
    }
  }
}

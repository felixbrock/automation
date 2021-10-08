// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSubscriptions,
  DeleteSubscriptionsRequestDto,
  DeleteSubscriptionsResponseDto,
} from '../../../domain/subscription/delete-subscriptions';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

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

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
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

      const useCaseResult: DeleteSubscriptionsResponseDto =
        await this.#deleteSubscriptions.execute(buildDtoResult.value);

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
    } catch (error) {
      return DeleteSubscriptionsController.fail(res, error);
    }
  }
}

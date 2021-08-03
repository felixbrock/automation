// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteSubscription,
  DeleteSubscriptionRequestDto,
  DeleteSubscriptionResponseDto,
} from '../../../domain/subscription/delete-subscription';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class DeleteSubscriptionController extends BaseController {
  #deleteSubscription: DeleteSubscription;

  public constructor(deleteSubscription: DeleteSubscription) {
    super();
    this.#deleteSubscription = deleteSubscription;
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

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<DeleteSubscriptionRequestDto> = this.#buildRequestDto(req);

      if(buildDtoResult.error) return DeleteSubscriptionController.badRequest(res, buildDtoResult.error);
      if(!buildDtoResult.value) return DeleteSubscriptionController.badRequest(res, 'Invalid request query paramerters');

      const useCaseResult: DeleteSubscriptionResponseDto =
        await this.#deleteSubscription.execute(buildDtoResult.value);

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
    } catch (error) {
      return DeleteSubscriptionController.fail(res, error);
    }
  }
}

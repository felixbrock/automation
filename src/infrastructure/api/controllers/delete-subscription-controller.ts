// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteSubscription,
  DeleteSubscriptionRequestDto,
  DeleteSubscriptionResponseDto,
} from '../../../domain/subscription/delete-subscription';
import { BaseController, CodeHttp } from '../../shared';

export default class DeleteSubscriptionController extends BaseController {
  #deleteSubscription: DeleteSubscription;

  public constructor(deleteSubscription: DeleteSubscription) {
    super();
    this.#deleteSubscription = deleteSubscription;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSubscriptionRequestDto => ({
    subscriptionId: httpRequest.params.subscriptionId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: DeleteSubscriptionRequestDto =
        this.#buildRequestDto(req);

      const useCaseResult: DeleteSubscriptionResponseDto =
        await this.#deleteSubscription.execute(requestDto);

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

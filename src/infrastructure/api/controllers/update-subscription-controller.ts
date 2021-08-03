// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  UpdateSubscription,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionResponseDto,
} from '../../../domain/subscription/update-subscription';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class UpdateSubscriptionController extends BaseController {
  #updateSubscription: UpdateSubscription;

  public constructor(updateSubscription: UpdateSubscription) {
    super();
    this.#updateSubscription = updateSubscription;
  }

  #buildRequestDto = (httpRequest: Request): UpdateSubscriptionRequestDto => ({
    automationId: httpRequest.params.automationId,
    selectorId: httpRequest.body.selectorId,
    alertsAccessedOn: httpRequest.body.alertsAccessedOn || undefined,
    alertsAccessedOnByUser: httpRequest.body.alertsAccessedOnByUser || undefined,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: UpdateSubscriptionRequestDto = this.#buildRequestDto(req);
      const useCaseResult: UpdateSubscriptionResponseDto =
        await this.#updateSubscription.execute(requestDto);

      if (useCaseResult.error) {
        return UpdateSubscriptionController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return UpdateSubscriptionController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return UpdateSubscriptionController.fail(res, error);
    }
  }
}

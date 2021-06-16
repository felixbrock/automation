// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateSubscription,
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
} from '../../../domain/subscription/create-subscription';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateSubscriptionController extends BaseController {
  #createSubscription: CreateSubscription;

  public constructor(createSubscription: CreateSubscription) {
    super();
    this.#createSubscription = createSubscription;
  }

  #buildRequestDto = (httpRequest: Request): CreateSubscriptionRequestDto => ({
    automationName: httpRequest.body.automationName,
    systemId: httpRequest.body.systemId,
    selectorId: httpRequest.body.selectorId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateSubscriptionRequestDto = this.#buildRequestDto(req);
      const useCaseResult: CreateSubscriptionResponseDto =
        await this.#createSubscription.execute(requestDto);

      if (useCaseResult.error) {
        return CreateSubscriptionController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return CreateSubscriptionController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error) {
      return CreateSubscriptionController.fail(res, error);
    }
  }
}

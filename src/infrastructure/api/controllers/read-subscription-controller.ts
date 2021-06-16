// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSubscription,
  ReadSubscriptionRequestDto,
  ReadSubscriptionResponseDto,
} from '../../../domain/subscription/read-subscription';
import { BaseController, CodeHttp } from '../../shared';

export default class ReadSubscriptionController extends BaseController {
  #readSubscription: ReadSubscription;

  public constructor(readSubscription: ReadSubscription) {
    super();
    this.#readSubscription = readSubscription;
  }

  #buildRequestDto = (httpRequest: Request): ReadSubscriptionRequestDto => ({
    id: httpRequest.params.subscriptionId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadSubscriptionRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadSubscriptionResponseDto =
        await this.#readSubscription.execute(requestDto);

      if (useCaseResult.error) {
        return ReadSubscriptionController.badRequest(res, useCaseResult.error);
      }

      return ReadSubscriptionController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSubscriptionController.fail(res, error);
    }
  }
}

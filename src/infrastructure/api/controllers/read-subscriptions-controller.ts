// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSubscriptions,
  ReadSubscriptionsRequestDto,
  ReadSubscriptionsResponseDto,
} from '../../../domain/subscription/read-subscriptions';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadSubscriptionsController extends BaseController {
  #readSubscriptions: ReadSubscriptions;

  public constructor(readSubscriptions: ReadSubscriptions) {
    super();
    this.#readSubscriptions = readSubscriptions;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<ReadSubscriptionsRequestDto> => {
    const {
      automationName,
      targetSelectorId,
      targetSystemId,
      modifiedOn,
      alertsAccessedOn,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      automationName,
      targetSelectorId,
      targetSystemId,
      modifiedOn,
      alertsAccessedOn,
    ]);
    if (!requestValid)
      return Result.fail<ReadSubscriptionsRequestDto>(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadSubscriptionsRequestDto>({
        automationName:
          typeof automationName === 'string' ? automationName : undefined,
        target: {
          selectorId:
            typeof targetSelectorId === 'string' ? targetSelectorId : undefined,
          systemId:
            typeof targetSystemId === 'string' ? targetSystemId : undefined,
        },
        alertsAccessedOn:
          alertsAccessedOn === 'string'
            ? parseInt(alertsAccessedOn, 10)
            : undefined,
        modifiedOn:
          typeof modifiedOn === 'string' ? parseInt(modifiedOn, 10) : undefined,
      });
    } catch (error) {
      return Result.fail<ReadSubscriptionsRequestDto>(error.message);
    }
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<ReadSubscriptionsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadSubscriptionsController.badRequest(
          res,
          buildDtoResult.error
        );
      if (!buildDtoResult.value)
        return ReadSubscriptionsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadSubscriptionsResponseDto =
        await this.#readSubscriptions.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadSubscriptionsController.badRequest(res, useCaseResult.error);
      }

      return ReadSubscriptionsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSubscriptionsController.fail(res, error);
    }
  }
}

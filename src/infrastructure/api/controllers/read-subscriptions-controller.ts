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
      accountId,
      targetSelectorId,
      targetSystemId,
      targetAlertsAccessedOnStart,
      targetAlertsAccessedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      automationName,
      accountId,
      targetSelectorId,
      targetSystemId,
      targetAlertsAccessedOnStart,
      targetAlertsAccessedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

      const startTime = '00:00:00';
      const endTime = '23:59:59';
  
      if (
        typeof timezoneOffset === 'string' &&
        timezoneOffset.indexOf('-') === -1 &&
        timezoneOffset.indexOf('+') === -1
      )
        throw new Error(
          `TimezoneOffset is not in correct format. '-' or '+' missing. Make sure to use URL encoding ('-'; '%2B' for '+' character)`
        );

    try {
      return Result.ok<ReadSubscriptionsRequestDto>({
        automationName:
          typeof automationName === 'string' ? automationName : undefined,
        accountId: typeof accountId === 'string' ? accountId : undefined,
        target: {
          selectorId:
            typeof targetSelectorId === 'string' ? targetSelectorId : undefined,
          systemId:
            typeof targetSystemId === 'string' ? targetSystemId : undefined,
          alertsAccessedOnStart:
            typeof targetAlertsAccessedOnStart === 'string'
              ? Date.parse(
                  `${targetAlertsAccessedOnStart} ${startTime} ${timezoneOffset || ''}`
                )
              : undefined,
          alertsAccessedOnEnd:
            typeof targetAlertsAccessedOnEnd === 'string'
              ? Date.parse(
                  `${targetAlertsAccessedOnEnd} ${endTime} ${timezoneOffset || ''}`
                )
              : undefined,
        },
        modifiedOnStart:
        typeof modifiedOnStart === 'string'
          ? Date.parse(
              `${modifiedOnStart} ${startTime} ${timezoneOffset || ''}`
            )
          : undefined,
      modifiedOnEnd:
        typeof modifiedOnEnd === 'string'
          ? Date.parse(`${modifiedOnEnd} ${endTime} ${timezoneOffset || ''}`)
          : undefined,
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

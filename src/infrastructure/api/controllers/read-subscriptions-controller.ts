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
              ? this.#buildDate(targetAlertsAccessedOnStart)
              : undefined,
          alertsAccessedOnEnd:
            typeof targetAlertsAccessedOnEnd === 'string'
              ? this.#buildDate(targetAlertsAccessedOnEnd)
              : undefined,
        },
        modifiedOnStart:
        typeof modifiedOnStart === 'string'
          ? this.#buildDate(modifiedOnStart)
          : undefined,
      modifiedOnEnd:
        typeof modifiedOnEnd === 'string'
          ? this.#buildDate(modifiedOnEnd)
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

  #buildDate = (timestamp: string): number => {
    const date = timestamp.match(/[^T]*/s);
    const time = timestamp.match(/(?<=T)[^Z]*/s);

    if ((!date || !date[0] || date[0].length !== 8) || (!time || !time[0] || time[0].length !== 6))
      throw new Error(
        `${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`
      );

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
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

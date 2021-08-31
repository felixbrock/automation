// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAutomations,
  ReadAutomationsRequestDto,
  ReadAutomationsResponseDto,
} from '../../../domain/automation/read-automations';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadAutomationsController extends BaseController {
  #readAutomations: ReadAutomations;

  public constructor(readAutomations: ReadAutomations) {
    super();
    this.#readAutomations = readAutomations;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<ReadAutomationsRequestDto> => {
    const {
      name,
      accountId,
      subscriptionSelectorId,
      subscriptionSystemId,
      subscriptionAlertsAccessedOnStart,
      subscriptionAlertsAccessedOnEnd,
      subscriptionAlertsAccessedOnByUserStart,
      subscriptionAlertsAccessedOnByUserEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      accountId,
      subscriptionSelectorId,
      subscriptionSystemId,
      subscriptionAlertsAccessedOnStart,
      subscriptionAlertsAccessedOnEnd,
      subscriptionAlertsAccessedOnByUserStart,
      subscriptionAlertsAccessedOnByUserEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadAutomationsRequestDto>({
        name:
          typeof name === 'string' ? name : undefined,
        accountId: typeof accountId === 'string' ? accountId : undefined,
        subscription: {
          selectorId:
            typeof subscriptionSelectorId === 'string' ? subscriptionSelectorId : undefined,
          systemId:
            typeof subscriptionSystemId === 'string' ? subscriptionSystemId : undefined,
          alertsAccessedOnStart:
            typeof subscriptionAlertsAccessedOnStart === 'string'
              ? this.#buildDate(subscriptionAlertsAccessedOnStart)
              : undefined,
          alertsAccessedOnEnd:
            typeof subscriptionAlertsAccessedOnEnd === 'string'
              ? this.#buildDate(subscriptionAlertsAccessedOnEnd)
              : undefined,
          alertsAccessedOnByUserStart:
            typeof subscriptionAlertsAccessedOnByUserStart === 'string'
              ? this.#buildDate(subscriptionAlertsAccessedOnByUserStart)
              : undefined,
          alertsAccessedOnByUserEnd:
            typeof subscriptionAlertsAccessedOnByUserEnd === 'string'
              ? this.#buildDate(subscriptionAlertsAccessedOnByUserEnd)
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
      return Result.fail<ReadAutomationsRequestDto>(typeof error === 'string' ? error : error.message);
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

    if (
      !date ||
      !date[0] ||
      date[0].length !== 8 ||
      !time ||
      !time[0] ||
      time[0].length !== 6
    )
      throw new Error(`${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`);

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
      const buildDtoResult: Result<ReadAutomationsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadAutomationsController.badRequest(
          res,
          buildDtoResult.error
        );
      if (!buildDtoResult.value)
        return ReadAutomationsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadAutomationsResponseDto =
        await this.#readAutomations.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadAutomationsController.badRequest(res, useCaseResult.error);
      }

      return ReadAutomationsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadAutomationsController.fail(res, error);
    }
  }
}

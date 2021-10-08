// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateAutomation,
  CreateAutomationRequestDto,
  CreateAutomationResponseDto,
} from '../../../domain/automation/create-automation';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateAutomationController extends BaseController {
  #createAutomation: CreateAutomation;

  #getAccounts: GetAccounts;

  public constructor(createAutomation: CreateAutomation, getAccounts: GetAccounts) {
    super();
    this.#createAutomation = createAutomation;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateAutomationRequestDto => ({
    name: httpRequest.body.name,
    accountId: httpRequest.body.accountId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateAutomationRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: CreateAutomationResponseDto =
        await this.#createAutomation.execute(requestDto);

      if (useCaseResult.error) {
        return CreateAutomationController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return CreateAutomationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error) {
      return CreateAutomationController.fail(res, error);
    }
  }
}

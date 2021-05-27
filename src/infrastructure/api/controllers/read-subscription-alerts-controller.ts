// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSubscription,
  ReadSubscriptionRequestDto,
  ReadSubscriptionResponseDto,
} from '../../../domain/use-cases/read-subscription';
import {
  ReadAlert,
  ReadAlertDto,
  ReadAlertResponseDto,
} from '../../../domain/use-cases/read-alert';
import {
  ReadSelector,
  ReadSelectorResponseDto,
} from '../../../domain/use-cases/read-selector';
import { BaseController, CodeHttp } from '../../shared';
import { Result } from '../../../domain/entities/value-types';
import { Target } from '../../../domain/entities/reference-types';

export default class ReadSubscriptionAlertsController extends BaseController {
  #readSubscription: ReadSubscription;

  #readAlert: ReadAlert;

  #readSelector: ReadSelector;

  #alerts: SubscriptionAlertDto[];

  #warnings: SubscriptionAlertDto[];

  public constructor(
    readSubscription: ReadSubscription,
    readAlert: ReadAlert,
    readSelector: ReadSelector
  ) {
    super();
    this.#readSubscription = readSubscription;
    this.#readAlert = readAlert;
    this.#readSelector = readSelector;
    this.#alerts = [];
    this.#warnings = [];
  }

  #buildReadSubscriptionRequestDto = (
    httpRequest: Request
  ): ReadSubscriptionRequestDto => ({
    id: httpRequest.params.id,
  });

  // TODO - replace all try catch with then catch
  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const subscriptionDto: ReadSubscriptionResponseDto =
        await this.readSubscription(req);

      if (subscriptionDto.error)
        return ReadSubscriptionAlertsController.badRequest(
          res,
          subscriptionDto.error
        );
      if (!subscriptionDto.value)
        return ReadSubscriptionAlertsController.fail(
          res,
          'Subscription was not transfered'
        );

      await this.readAlerts(subscriptionDto.value.targets);

      // TODO - FIX URGENTLY ONLY workaround. Move to use-case
      const alerts = this.#alerts;
      const warnings = this.#warnings;

      this.#alerts = [];
      this.#warnings = [];

      return ReadSubscriptionAlertsController.ok(
        res,
        { alerts, warnings },
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSubscriptionAlertsController.fail(res, error);
    }
  }

  private async readAlerts(targets: Target[]): Promise<Result<null>> {
    try {

      await Promise.all(
        targets.map(async (target) => {
          const alertDto: ReadAlertResponseDto = await this.#readAlert.execute({
            target,
          });

          if (!alertDto || !alertDto.value) return;

          const selectorDto: ReadSelectorResponseDto =
            await this.#readSelector.execute({ target });

          if (selectorDto.error) return;
          if (!selectorDto.value) return;

          if (alertDto.value.selectorId === target.selectorId)
            this.pushAlert(
              alertDto.value,
              selectorDto.value.selectorContent,
              selectorDto.value.systemName
            );
          else if (alertDto.value.systemId === target.systemId)
            this.pushWarning(alertDto.value, selectorDto.value.systemName);
        })
      );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error);
    }
  }

  private async readSubscription(
    req: Request
  ): Promise<ReadSubscriptionResponseDto> {
    try {
      const readSubscriptionRequestDto: ReadSubscriptionRequestDto =
        this.#buildReadSubscriptionRequestDto(req);

      return await this.#readSubscription.execute(readSubscriptionRequestDto);
    } catch (error) {
      return Result.fail<null>(error);
    }
  }

  private pushAlert(
    alertDto: ReadAlertDto,
    selectorContent: string | null,
    systemName: string | null
  ): void {
    const alertMessage = `An error occurred on selector ${selectorContent} in system ${systemName}.`;

    const alert = this.#alerts.find(
      (alertEntity: { message: string }) => alertEntity.message === alertMessage
    );

    if (!alert) this.#alerts.push({ id: alertDto.id, message: alertMessage });
  }

  private pushWarning(alertDto: ReadAlertDto, systemName: string | null): void {
    const warningMessage = `An error occurred in system ${systemName} on a selector. Your automation might be affected.`;

    const warning = this.#warnings.find(
      (warningEntity: { message: string }) =>
        warningEntity.message === warningMessage
    );

    if (!warning)
      this.#warnings.push({ id: alertDto.id, message: warningMessage });
  }
}

interface SubscriptionAlertDto {
  id: string;
  message: string;
}

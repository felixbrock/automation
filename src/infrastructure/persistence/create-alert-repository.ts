import fs from 'fs';
import path from 'path';
import {
  CreateAlertDto,
  ICreateAlertRepository,
} from '../../domain/use-cases/create-alert';
import { Alert } from '../../domain/object-types/entities';

export default class CreateAlertRepositoryImpl
  implements ICreateAlertRepository
{
  public async save(alert: Alert): Promise<void> {
    const data: string = fs.readFileSync(path.resolve(__dirname, '../../../db.json'), 'utf-8');
    const db = JSON.parse(data);

    db.alerts.push(this.#toPersistence(alert));

    fs.writeFileSync(path.resolve(__dirname, '../../../db.json'), JSON.stringify(db), 'utf-8');
  }

  #toPersistence = (alert: Alert): CreateAlertDto => ({
    systemId: alert.systemId,
    selectorId: alert.selectorId,
    createdOn: alert.createdOn,
  });
}

import fs from 'fs';
import path from 'path';
import {
  IReadAlertRepository,
  ReadAlertDto,
} from '../../domain/use-cases/read-alert';

export default class ReadAlertRepositoryImpl implements IReadAlertRepository {
  public findByTarget = async (
    selectorId: string,
    systemId: string
  ): Promise<ReadAlertDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    let result = db.alerts.find(
      (alertEntity: { selectorId: string }) =>
        alertEntity.selectorId === selectorId
    );

    if (result) return result;

    result = db.alerts.find(
      (alertEntity: { systemId: string }) =>
        alertEntity.systemId === systemId
    );

    return result || null;
  };
}

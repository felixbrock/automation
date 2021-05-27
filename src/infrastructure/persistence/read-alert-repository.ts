import fs from 'fs';
import path from 'path';
import { Target } from '../../domain/entities/reference-types';
import {
  IReadAlertRepository,
  ReadAlertDto,
} from '../../domain/use-cases/read-alert';

export default class ReadAlertRepositoryImpl implements IReadAlertRepository {
  public findByTarget = async (
    target: Target
  ): Promise<ReadAlertDto | null> => {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    const db = JSON.parse(data);

    let result = db.alerts.find(
      (alertEntity: { selectorId: string }) =>
        alertEntity.selectorId === target.selectorId
    );

    if (result) return result;

    result = db.alerts.find(
      (alertEntity: { systemId: string }) =>
        alertEntity.systemId === target.systemId
    );

    return result || null;
  };
}

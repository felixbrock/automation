import fs from 'fs';
import path from 'path';
import { Target } from '../../domain/object-types/value-types';
import {
  CreateTargetDto,
  ICreateTargetRepository,
} from '../../domain/use-cases/create-target';

export default class CreateTargetRepositoryImpl
  implements ICreateTargetRepository
{
  public async save(target: Target): Promise<void> {
    const data: string = fs.readFileSync(
      path.resolve(__dirname, '../../../db.json'),
      'utf-8'
    );
    // TODO No error handling in place
    const db = JSON.parse(data);

    // TODO no error handling in place if subscription does not exist. Place it within calling class anyways
    for (let i = 0; i < db.subscriptions.length; i += 1) {
      if (db.subscriptions[i].id === target.subscriptionId) {
        db.subscriptions[i].targets.push(this.#toPersistence(target));
        break;
      }
    }

    fs.writeFileSync(
      path.resolve(__dirname, '../../../db.json'),
      JSON.stringify(db),
      'utf-8'
    );
  }

  #toPersistence = (target: Target): CreateTargetDto => ({
    subscriptionId: target.subscriptionId,
    selectorId: target.selectorId,
    systemId: target.systemId,
    createdOn: target.createdOn,
  });
}

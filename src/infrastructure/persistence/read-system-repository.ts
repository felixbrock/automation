import fetch from 'node-fetch';
import {  } from '../../domain/use-cases/read-selector';
import { IReadSystemRepository, ReadSystemDto } from '../../domain/use-cases/read-system';

export default class ReadSystemRepositoryImpl
  implements IReadSystemRepository
{
  public getSystemById = async (id: string): Promise<ReadSystemDto | null> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/system/${id}`
      );
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
}

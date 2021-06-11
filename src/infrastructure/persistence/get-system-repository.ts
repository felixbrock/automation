import fetch from 'node-fetch';
import {  } from '../../domain/use-cases/get-selector';
import { IGetSystemRepository, GetSystemDto } from '../../domain/use-cases/get-system';

export default class GetSystemRepositoryImpl
  implements IGetSystemRepository
{
  public getSystemById = async (id: string): Promise<GetSystemDto | null> => {
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

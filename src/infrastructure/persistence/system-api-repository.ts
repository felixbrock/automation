import fetch from 'node-fetch';
import { IGetSystemRepository, GetSystemDto } from '../../domain/system-api/get-system';

export default class GetSystemRepositoryImpl
  implements IGetSystemRepository
{
  // TODO Should return a selector object and not a DTO!! When to use a Dto?
  public getById = async (id: string): Promise<GetSystemDto | null> => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/system/${id}`
      );
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
      }
      return null;
    } catch (error) {
      // TODO reject promise I guess
      return null;
    }
  };
}

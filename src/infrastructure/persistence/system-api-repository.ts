import axios from 'axios';
import { IGetSystemRepository, SystemDto } from '../../domain/system-api/get-system';

const apiRoot = 'http://localhost:3002/api/v1';

export default class GetSystemRepositoryImpl
  implements IGetSystemRepository
{
  // TODO Should return a selector object and not a DTO!! When to use a Dto?

  public getOne = async (
    systemId: string
  ): Promise<SystemDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/system/${systemId}`);
      const jsonResponse = await response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}

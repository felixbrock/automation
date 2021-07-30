import axios from 'axios';
import { IGetSystemRepository, SystemDto } from '../../domain/system-api/get-system';

const apiRoot = 'http://localhost:3002/api/v1';

export default class GetSystemRepositoryImpl
  implements IGetSystemRepository
{
  public getOne = async (
    systemId: string
  ): Promise<SystemDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/system/${systemId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}

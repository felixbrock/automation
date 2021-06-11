import fetch from 'node-fetch';
import { IGetSelectorRepository, GetSelectorDto } from '../../domain/use-cases/get-selector';

export default class GetSelectorRepositoryImpl
  implements IGetSelectorRepository
{
  public getById = async (
    id: string
  ): Promise<GetSelectorDto | null> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/selector/${id}`
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

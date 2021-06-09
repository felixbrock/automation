import fetch from 'node-fetch';
import { IReadSelectorRepository, ReadSelectorDto } from '../../domain/use-cases/read-selector';

export default class ReadSelectorRepositoryImpl
  implements IReadSelectorRepository
{
  public getSelectorById = async (
    id: string
  ): Promise<ReadSelectorDto | null> => {
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

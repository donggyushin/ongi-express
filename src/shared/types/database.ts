import { QueryResult } from 'pg';

export interface IDatabaseService {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  getClient(): Promise<any>;
  healthCheck(): Promise<boolean>;
}
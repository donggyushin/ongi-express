import { QueryResult, QueryResultRow } from 'pg';

export interface IDatabaseService {
  query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  getClient(): Promise<any>;
  healthCheck(): Promise<boolean>;
}
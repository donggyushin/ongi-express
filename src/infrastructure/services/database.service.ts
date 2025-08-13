import { Pool, QueryResult, PoolClient } from 'pg';
import { IDatabaseService } from '@/shared/types';
import { DatabaseConfig } from '@/infrastructure/config/database.config';

export class DatabaseService implements IDatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = DatabaseConfig.getInstance();
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      const result = await this.pool.query<T>(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health_check');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}
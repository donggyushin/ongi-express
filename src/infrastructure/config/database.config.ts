import { Pool, PoolConfig } from 'pg';

export class DatabaseConfig {
  private static instance: Pool;

  public static getInstance(): Pool {
    if (!DatabaseConfig.instance) {
      const config: PoolConfig = {
        connectionString: process.env.DATABASE_URL,
        // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      DatabaseConfig.instance = new Pool(config);
    }

    return DatabaseConfig.instance;
  }

  public static async closeConnection(): Promise<void> {
    if (DatabaseConfig.instance) {
      await DatabaseConfig.instance.end();
    }
  }
}
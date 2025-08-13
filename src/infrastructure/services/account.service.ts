import { Account, AccountType } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { IDatabaseService } from '@/shared/types';

interface AccountRow {
  id: string;
  type: string;
  created_at: Date;
}

export class AccountService implements IAccountRepository {
  constructor(private databaseService: IDatabaseService) {}

  async create(id: string, type: AccountType): Promise<Account> {
    const query = `
      INSERT INTO accounts (id, type, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, type, created_at
    `;
    
    try {
      const result = await this.databaseService.query<AccountRow>(query, [id, type]);
      const row = result.rows[0];
      
      return new Account(row.id, row.type as AccountType, row.created_at);
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  }

  async findById(id: string): Promise<Account | null> {
    const query = 'SELECT id, type, created_at FROM accounts WHERE id = $1';
    
    try {
      const result = await this.databaseService.query<AccountRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return new Account(row.id, row.type as AccountType, row.created_at);
    } catch (error) {
      console.error('Error finding account by id:', error);
      throw new Error('Failed to find account');
    }
  }
}
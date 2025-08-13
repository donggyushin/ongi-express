import { Router } from 'express';
import { MigrationController } from '@/presentation/controllers/migration.controller';

export class MigrationRoutes {
  private router = Router();

  constructor(private readonly migrationController: MigrationController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/create-accounts-table', (req, res) => this.migrationController.createAccountsTable(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
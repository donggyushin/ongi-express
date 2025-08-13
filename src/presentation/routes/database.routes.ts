import { Router } from 'express';
import { DatabaseController } from '@/presentation/controllers';

export class DatabaseRoutes {
  private router = Router();

  constructor(private readonly databaseController: DatabaseController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/test', (req, res) => this.databaseController.testConnection(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
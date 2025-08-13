import { Router } from 'express';
import { DatabaseController } from '@/presentation/controllers';

export class DatabaseRoutes {
  public router: Router;

  constructor(private databaseController: DatabaseController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/test', this.databaseController.testConnection.bind(this.databaseController));
  }
}
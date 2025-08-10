import { Router } from 'express';
import { HealthController } from '@/presentation/controllers';

export class HealthRoutes {
  private router = Router();

  constructor(private readonly healthController: HealthController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', (req, res) => this.healthController.getHealth(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
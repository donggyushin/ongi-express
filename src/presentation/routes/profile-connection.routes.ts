import { Router } from 'express';
import { ProfileConnectionController } from '@/presentation/controllers';

export class ProfileConnectionRoutes {
  private router: Router;

  constructor(private profileConnectionController: ProfileConnectionController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /profile-connections/:profileId/add-random
    // AuthMiddleware를 사용하지 않음
    this.router.post('/:profileId/add-random', (req, res) => 
      this.profileConnectionController.addRandomConnection(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
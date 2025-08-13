import { Router } from 'express';
import { ProfileController } from '../controllers';

export class ProfileRoutes {
  public router: Router;

  constructor(private profileController: ProfileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /profiles/:accountId - Get user profile
    this.router.get('/:accountId', this.profileController.getProfile);

    // POST /profiles/:accountId/upload-image - Upload profile image
    this.router.post(
      '/:accountId/upload-image',
      this.profileController.uploadMiddleware,
      this.profileController.uploadProfileImage
    );
  }
}
import { Router } from 'express';
import { ProfileController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

export class ProfileRoutes {
  public router: Router;

  constructor(private profileController: ProfileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /profiles/me - Get current user profile
    this.router.get('/me', AuthMiddleware.verifyToken, this.profileController.getProfile);

    // POST /profiles/me/upload-image - Upload profile image for current user
    this.router.post(
      '/me/upload-image',
      AuthMiddleware.verifyToken,
      this.profileController.uploadMiddleware,
      this.profileController.uploadProfileImage
    );

    // PATCH /profiles/nickname - Update current user nickname
    this.router.patch('/nickname', AuthMiddleware.verifyToken, this.profileController.updateNickname);
  }
}
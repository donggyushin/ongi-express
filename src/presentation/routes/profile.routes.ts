import { Router } from 'express';
import { ProfileController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

export class ProfileRoutes {
  private router: Router;

  constructor(private profileController: ProfileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /profiles/:id - Get profile by ID (with optional authentication for isNew and isLikedByMe fields)
    this.router.get('/:id', AuthMiddleware.optionalVerifyToken, this.profileController.getProfileById);

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

    // POST /profiles/me/mbti - Update current user MBTI type
    this.router.post('/me/mbti', AuthMiddleware.verifyToken, this.profileController.updateMbti);

    // POST /profiles/me/gender - Update current user gender
    this.router.post('/me/gender', AuthMiddleware.verifyToken, this.profileController.updateGender);

    // POST /profiles/me/physical-info - Update current user height and weight
    this.router.post('/me/physical-info', AuthMiddleware.verifyToken, this.profileController.updatePhysicalInfo);

    // POST /profiles/me/introduction - Update current user introduction
    this.router.post('/me/introduction', AuthMiddleware.verifyToken, this.profileController.updateIntroduction);

    // POST /profiles/me/location - Update current user location
    this.router.post('/me/location', AuthMiddleware.verifyToken, this.profileController.updateLocation);

    // POST /profiles/me/fcm-token - Update current user FCM token
    this.router.post('/me/fcm-token', AuthMiddleware.verifyToken, this.profileController.updateFcmToken);

    // POST /profiles/me/qna - Add Q&A to profile
    this.router.post('/me/qna', AuthMiddleware.verifyToken, this.profileController.addQna);

    // POST /profiles/me/add-image - Add image to profile gallery
    this.router.post(
      '/me/add-image',
      AuthMiddleware.verifyToken,
      this.profileController.addImageMiddleware,
      this.profileController.addImage
    );

    // DELETE /profiles/me/images - Remove image from profile gallery (publicId in request body)
    this.router.delete('/me/images', AuthMiddleware.verifyToken, this.profileController.removeImage);

    // DELETE /profiles/me/qna - Remove Q&A from profile
    this.router.delete('/me/qna', AuthMiddleware.verifyToken, this.profileController.removeQna);

    // PATCH /profiles/me/qna - Update Q&A answer
    this.router.patch('/me/qna', AuthMiddleware.verifyToken, this.profileController.updateQna);
  }

  getRouter(): Router {
    return this.router;
  }
}
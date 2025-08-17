import { Router } from 'express';
import { ProfileConnectionController } from '@/presentation/controllers';
import { AuthMiddleware } from '@/presentation/middlewares';

export class ProfileConnectionRoutes {
  private router: Router;

  constructor(private profileConnectionController: ProfileConnectionController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /profile-connections/:profileId/add-random
    // AuthMiddleware를 사용하지 않음 (내부 시스템 호출용)
    this.router.post('/:profileId/add-random', (req, res) => 
      this.profileConnectionController.addRandomConnection(req, res)
    );

    // GET /profile-connections/profiles
    // 연결된 프로필들 조회, limit 쿼리 파라미터 지원
    this.router.get('/profiles', AuthMiddleware.verifyToken, (req, res) => 
      this.profileConnectionController.getConnectedProfiles(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
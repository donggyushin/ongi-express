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

    // POST /profile-connections/generate-for-active-profiles
    // 최근 활동한 프로필들에 대해 자동으로 연결 생성 (내부 시스템용)
    this.router.post('/generate-for-active-profiles', (req, res) => 
      this.profileConnectionController.generateConnectionsForActiveProfiles(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
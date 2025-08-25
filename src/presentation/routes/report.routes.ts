import { Router } from 'express';
import { ReportController } from '@/presentation/controllers';
import { AuthMiddleware } from '@/presentation/middlewares';

export class ReportRoutes {
  private router: Router;

  constructor(private reportController: ReportController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /reports/:reportedProfileId
    // Create a new report against a specific profile
    this.router.post('/:reportedProfileId', AuthMiddleware.verifyToken, (req, res) => 
      this.reportController.createReport(req, res)
    );

    // GET /reports/my-reports
    // Get reports I made against others
    this.router.get('/my-reports', AuthMiddleware.verifyToken, (req, res) => 
      this.reportController.getMyReports(req, res)
    );

    // GET /reports/against-me
    // Get reports made against me
    this.router.get('/against-me', AuthMiddleware.verifyToken, (req, res) => 
      this.reportController.getReportsAgainstMe(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
import { Router } from 'express';
import { QnAExamplesController } from '@/presentation/controllers';

export class QnAExamplesRoutes {
  private router = Router();

  constructor(private readonly qnaExamplesController: QnAExamplesController) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/examples', (req, res) => this.qnaExamplesController.getExamples(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
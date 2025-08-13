import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { Container } from '@/shared/utils';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes, AccountRoutes } from '@/presentation/routes';

dotenv.config();

class App {
  private app = express();
  private container = Container.getInstance();

  constructor() {
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    const welcomeRoutes = this.container.get<WelcomeRoutes>('welcomeRoutes');
    const healthRoutes = this.container.get<HealthRoutes>('healthRoutes');
    const databaseRoutes = this.container.get<DatabaseRoutes>('databaseRoutes');
    const accountRoutes = this.container.get<AccountRoutes>('accountRoutes');

    this.app.use('/', welcomeRoutes.getRouter());
    this.app.use('/health', healthRoutes.getRouter());
    this.app.use('/database', databaseRoutes.getRouter());
    this.app.use('/accounts', accountRoutes.getRouter());
  }

  private initializeErrorHandling(): void {
    const errorMiddleware = this.container.get<ErrorMiddleware>('errorMiddleware');

    this.app.use('*', (req, res) => errorMiddleware.notFound(req, res));
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => 
      errorMiddleware.handle(err, req, res, next)
    );
  }

  public listen(): void {
    const PORT = process.env.PORT || 3000;

    this.app.listen(PORT, () => {
      console.log(`🚀 Ongi server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  }

  public getApp() {
    return this.app;
  }
}

const app = new App();
app.listen();

export default app.getApp();
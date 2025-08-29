import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { Container } from '@/shared/utils';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes, AccountRoutes, ProfileRoutes, QnAExamplesRoutes, ProfileConnectionRoutes, ChatRoutes, ReportRoutes, NotificationDataRoutes } from '@/presentation/routes';
import { EmailVerificationRoutes } from '@/presentation/routes/email-verification.routes';
import { NotificationRoutes } from '@/presentation/routes/NotificationRoutes';
import { IRealtimeChatService } from '@/domain/interfaces/realtime-chat.service.interface';

dotenv.config();

class App {
  private app = express();
  private server = createServer(this.app);
  private container = Container.getInstance();

  constructor() {
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
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
    const profileRoutes = this.container.get<ProfileRoutes>('profileRoutes');
    const emailVerificationRoutes = this.container.get<EmailVerificationRoutes>('emailVerificationRoutes');
    const qnaExamplesRoutes = this.container.get<QnAExamplesRoutes>('qnaExamplesRoutes');
    const profileConnectionRoutes = this.container.get<ProfileConnectionRoutes>('profileConnectionRoutes');
    const chatRoutes = this.container.get<ChatRoutes>('chatRoutes');
    const reportRoutes = this.container.get<ReportRoutes>('reportRoutes');
    const notificationRoutes = this.container.get<NotificationRoutes>('notificationRoutes');
    const notificationDataRoutes = this.container.get<NotificationDataRoutes>('notificationDataRoutes');

    this.app.use('/', welcomeRoutes.getRouter());
    this.app.use('/health', healthRoutes.getRouter());
    this.app.use('/database', databaseRoutes.getRouter());
    this.app.use('/accounts', accountRoutes.getRouter());
    this.app.use('/profiles', profileRoutes.getRouter());
    this.app.use('/email-verification', emailVerificationRoutes.getRouter());
    this.app.use('/qna', qnaExamplesRoutes.getRouter());
    this.app.use('/profile-connections', profileConnectionRoutes.getRouter());
    this.app.use('/chats', chatRoutes.getRouter());
    this.app.use('/reports', reportRoutes.getRouter());
    this.app.use('/notifications/push', notificationRoutes.getRouter());
    this.app.use('/notifications', notificationDataRoutes.getRouter());
  }

  private initializeErrorHandling(): void {
    const errorMiddleware = this.container.get<ErrorMiddleware>('errorMiddleware');

    this.app.use('*', (req, res) => errorMiddleware.notFound(req, res));
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => 
      errorMiddleware.handle(err, req, res, next)
    );
  }

  private initializeWebSocket(): void {
    const realtimeChatService = this.container.get<IRealtimeChatService>('realtimeChatService');
    realtimeChatService.initialize(this.server);
    console.log('💬 WebSocket server initialized for real-time chat');
  }

  public listen(): void {
    const PORT = process.env.PORT || 3000;

    this.server.listen(PORT, () => {
      console.log(`🚀 Ongi server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`💬 WebSocket server ready for real-time chat`);
    });
  }

  public getApp() {
    return this.app;
  }
}

const app = new App();
app.listen();

export default app.getApp();
import { HealthUseCase, WelcomeUseCase, IHealthUseCase, IWelcomeUseCase, CreateAccountUseCase, ICreateAccountUseCase, GetAccountUseCase, IGetAccountUseCase, RefreshTokenUseCase, IRefreshTokenUseCase, DeleteAccountUseCase, IDeleteAccountUseCase, ProfileUseCase, IProfileUseCase, QnAExamplesUseCase, IQnAExamplesUseCase, ProfileConnectionUseCase, IProfileConnectionUseCase, CreateOrFindChatUseCase, ICreateOrFindChatUseCase, GetUserChatsUseCase, IGetUserChatsUseCase, AddMessageUseCase, IAddMessageUseCase, UpdateMessageReadInfoUseCase, IUpdateMessageReadInfoUseCase, GetChatByIdUseCase, IGetChatByIdUseCase, CreateReportUseCase, ICreateReportUseCase, GetMyReportsUseCase, IGetMyReportsUseCase, GetReportsAgainstMeUseCase, IGetReportsAgainstMeUseCase } from '@/domain/use-cases';
import { EmailVerificationUseCase, IEmailVerificationUseCase } from '@/domain/use-cases/email-verification.use-case';
import { NotificationUseCase, INotificationUseCase } from '@/domain/use-cases/notification.use-case';
import { IAccountRepository, ISystemRepository, IJwtRepository, IImageRepository, IProfileRepository, IEmailVerificationRepository, IProfileConnectionRepository, IChatRepository, IMessageRepository } from '@/domain/repositories';
import { IFirebaseService } from '@/domain/services/IFirebaseService';
import { IRealtimeChatService } from '@/domain/interfaces/realtime-chat.service.interface';
import { ConsoleLoggerService, ILoggerService, DatabaseService, SystemService, PrismaService, PrismaAccountService, JwtService, CloudinaryService, PrismaProfileService, PrismaProfileConnectionService, PrismaChatService, PrismaMessageService, RealtimeChatService } from '@/infrastructure/services';
import { FirebaseService } from '@/infrastructure/services/FirebaseService';
import { PrismaEmailVerificationService } from '@/infrastructure/services/prisma-email-verification.service';
import { MailgunService, IEmailService } from '@/infrastructure/services/mailgun.service';
import { GmailService } from '@/infrastructure/services/gmail.service';
import { IDatabaseService } from '@/shared/types';
import { HealthController, WelcomeController, DatabaseController, AccountController, ProfileController, QnAExamplesController, ProfileConnectionController, ChatController } from '@/presentation/controllers';
import { EmailVerificationController } from '@/presentation/controllers/email-verification.controller';
import { NotificationController } from '@/presentation/controllers/NotificationController';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes, AccountRoutes, ProfileRoutes, QnAExamplesRoutes, ProfileConnectionRoutes, ChatRoutes } from '@/presentation/routes';
import { EmailVerificationRoutes } from '@/presentation/routes/email-verification.routes';
import { NotificationRoutes } from '@/presentation/routes/NotificationRoutes';

export class Container {
  private static instance: Container;
  
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    // Infrastructure
    this.services.set('logger', new ConsoleLoggerService());
    this.services.set('database', new DatabaseService());
    this.services.set('prisma', PrismaService.getInstance());
    this.services.set('accountRepository', new PrismaAccountService(this.get('prisma')));
    this.services.set('profileRepository', new PrismaProfileService(this.get('prisma')));
    this.services.set('profileConnectionRepository', new PrismaProfileConnectionService(this.get('prisma')));
    this.services.set('chatRepository', new PrismaChatService(this.get('prisma')));
    this.services.set('messageRepository', new PrismaMessageService(this.get('prisma')));
    this.services.set('emailVerificationRepository', new PrismaEmailVerificationService(this.get('prisma')));
    this.services.set('imageRepository', new CloudinaryService(this.get<ILoggerService>('logger')));
    this.services.set('emailService', new GmailService());
    this.services.set('systemRepository', new SystemService());
    this.services.set('jwtRepository', new JwtService());
    this.services.set('realtimeChatService', new RealtimeChatService());
    this.services.set('firebaseService', new FirebaseService(this.get<ILoggerService>('logger')));

    // Use Cases
    this.services.set('healthUseCase', new HealthUseCase(this.get<ISystemRepository>('systemRepository')));
    this.services.set('welcomeUseCase', new WelcomeUseCase());
    this.services.set('createAccountUseCase', new CreateAccountUseCase(
      this.get<IAccountRepository>('accountRepository'),
      this.get<IJwtRepository>('jwtRepository')
    ));
    this.services.set('getAccountUseCase', new GetAccountUseCase(this.get<IAccountRepository>('accountRepository')));
    this.services.set('deleteAccountUseCase', new DeleteAccountUseCase(this.get<IAccountRepository>('accountRepository')));
    this.services.set('refreshTokenUseCase', new RefreshTokenUseCase(this.get<IJwtRepository>('jwtRepository')));
    this.services.set('profileUseCase', new ProfileUseCase(
      this.get<IProfileRepository>('profileRepository'),
      this.get<IImageRepository>('imageRepository'),
      this.get<IProfileConnectionRepository>('profileConnectionRepository')
    ));
    this.services.set('emailVerificationUseCase', new EmailVerificationUseCase(
      this.get<IEmailVerificationRepository>('emailVerificationRepository'),
      this.get<IProfileRepository>('profileRepository'),
      this.get<IEmailService>('emailService')
    ));
    this.services.set('qnaExamplesUseCase', new QnAExamplesUseCase());
    this.services.set('profileConnectionUseCase', new ProfileConnectionUseCase(
      this.get<IProfileConnectionRepository>('profileConnectionRepository'),
      this.get<IProfileRepository>('profileRepository'),
      this.get<IFirebaseService>('firebaseService')
    ));
    this.services.set('createOrFindChatUseCase', new CreateOrFindChatUseCase(
      this.get<IChatRepository>('chatRepository'),
      this.get<IProfileRepository>('profileRepository')
    ));
    this.services.set('getUserChatsUseCase', new GetUserChatsUseCase(
      this.get<IChatRepository>('chatRepository'),
      this.get<IProfileRepository>('profileRepository')
    ));
    this.services.set('addMessageUseCase', new AddMessageUseCase(
      this.get<IMessageRepository>('messageRepository'),
      this.get<IChatRepository>('chatRepository'),
      this.get<IProfileRepository>('profileRepository'),
      this.get<IFirebaseService>('firebaseService')
    ));
    this.services.set('updateMessageReadInfoUseCase', new UpdateMessageReadInfoUseCase(
      this.get<IChatRepository>('chatRepository')
    ));
    this.services.set('getChatByIdUseCase', new GetChatByIdUseCase(
      this.get<IChatRepository>('chatRepository')
    ));
    this.services.set('notificationUseCase', new NotificationUseCase(this.get<IFirebaseService>('firebaseService')));

    // Controllers
    this.services.set('healthController', new HealthController(this.get<IHealthUseCase>('healthUseCase')));
    this.services.set('welcomeController', new WelcomeController(this.get<IWelcomeUseCase>('welcomeUseCase')));
    this.services.set('databaseController', new DatabaseController(this.get<IDatabaseService>('database')));
    this.services.set('accountController', new AccountController(
      this.get<ICreateAccountUseCase>('createAccountUseCase'),
      this.get<IGetAccountUseCase>('getAccountUseCase'),
      this.get<IRefreshTokenUseCase>('refreshTokenUseCase'),
      this.get<IDeleteAccountUseCase>('deleteAccountUseCase')
    ));
    this.services.set('profileController', new ProfileController(this.get<IProfileUseCase>('profileUseCase')));
    this.services.set('emailVerificationController', new EmailVerificationController(this.get<IEmailVerificationUseCase>('emailVerificationUseCase')));
    this.services.set('qnaExamplesController', new QnAExamplesController(this.get<IQnAExamplesUseCase>('qnaExamplesUseCase')));
    this.services.set('profileConnectionController', new ProfileConnectionController(this.get<IProfileConnectionUseCase>('profileConnectionUseCase')));
    this.services.set('chatController', new ChatController(
      this.get<ICreateOrFindChatUseCase>('createOrFindChatUseCase'),
      this.get<IGetUserChatsUseCase>('getUserChatsUseCase'),
      this.get<IAddMessageUseCase>('addMessageUseCase'),
      this.get<IUpdateMessageReadInfoUseCase>('updateMessageReadInfoUseCase'),
      this.get<IGetAccountUseCase>('getAccountUseCase'),
      this.get<IGetChatByIdUseCase>('getChatByIdUseCase'),
      this.get<IRealtimeChatService>('realtimeChatService')
    ));
    this.services.set('notificationController', new NotificationController(this.get<INotificationUseCase>('notificationUseCase')));

    // Middlewares
    this.services.set('errorMiddleware', new ErrorMiddleware(this.get<ILoggerService>('logger')));

    // Routes
    this.services.set('healthRoutes', new HealthRoutes(this.get<HealthController>('healthController')));
    this.services.set('welcomeRoutes', new WelcomeRoutes(this.get<WelcomeController>('welcomeController')));
    this.services.set('databaseRoutes', new DatabaseRoutes(this.get<DatabaseController>('databaseController')));
    this.services.set('accountRoutes', new AccountRoutes(this.get<AccountController>('accountController')));
    this.services.set('profileRoutes', new ProfileRoutes(this.get<ProfileController>('profileController')));
    this.services.set('emailVerificationRoutes', new EmailVerificationRoutes(this.get<EmailVerificationController>('emailVerificationController')));
    this.services.set('qnaExamplesRoutes', new QnAExamplesRoutes(this.get<QnAExamplesController>('qnaExamplesController')));
    this.services.set('profileConnectionRoutes', new ProfileConnectionRoutes(this.get<ProfileConnectionController>('profileConnectionController')));
    this.services.set('chatRoutes', new ChatRoutes(this.get<ChatController>('chatController')));
    this.services.set('notificationRoutes', new NotificationRoutes(
      this.get<NotificationController>('notificationController'),
      this.get<IFirebaseService>('firebaseService')
    ));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
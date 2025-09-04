import { HealthUseCase, WelcomeUseCase, IHealthUseCase, IWelcomeUseCase, CreateAccountUseCase, ICreateAccountUseCase, GetAccountUseCase, IGetAccountUseCase, GetAccountByEmailUseCase, IGetAccountByEmailUseCase, CreateAccountWithEmailPasswordUseCase, ICreateAccountWithEmailPasswordUseCase, LoginWithEmailPasswordUseCase, ILoginWithEmailPasswordUseCase, RefreshTokenUseCase, IRefreshTokenUseCase, DeleteAccountUseCase, IDeleteAccountUseCase, ProfileUseCase, IProfileUseCase, QnAExamplesUseCase, IQnAExamplesUseCase, ProfileConnectionUseCase, IProfileConnectionUseCase, CreateOrFindChatUseCase, ICreateOrFindChatUseCase, GetUserChatsUseCase, IGetUserChatsUseCase, AddMessageUseCase, IAddMessageUseCase, UpdateMessageReadInfoUseCase, IUpdateMessageReadInfoUseCase, GetChatByIdUseCase, IGetChatByIdUseCase, LeaveChatUseCase, ILeaveChatUseCase, CreateReportUseCase, ICreateReportUseCase, GetMyReportsUseCase, IGetMyReportsUseCase, GetReportsAgainstMeUseCase, IGetReportsAgainstMeUseCase } from '@/domain/use-cases';
import { EmailVerificationUseCase, IEmailVerificationUseCase } from '@/domain/use-cases/email-verification.use-case';
import { SendPasswordResetUseCase, VerifyPasswordResetCodeUseCase, ResetPasswordUseCase, ISendPasswordResetUseCase, IVerifyPasswordResetCodeUseCase, IResetPasswordUseCase } from '@/domain/use-cases/password-reset.use-case';
import { NotificationUseCase, INotificationUseCase } from '@/domain/use-cases/notification.use-case';
import { NotificationDataUseCase, INotificationDataUseCase } from '@/domain/use-cases/notification-data.use-case';
import { IAccountRepository, ISystemRepository, IJwtRepository, IImageRepository, IProfileRepository, IEmailVerificationRepository, IProfileConnectionRepository, IChatRepository, IMessageRepository, IReportRepository, INotificationRepository } from '@/domain/repositories';
import { IPasswordResetRepository } from '@/domain/repositories/password-reset.repository';
import { IFirebaseService } from '@/domain/services/IFirebaseService';
import { IRealtimeChatService } from '@/domain/interfaces/realtime-chat.service.interface';
import { ConsoleLoggerService, ILoggerService, DatabaseService, SystemService, PrismaService, PrismaAccountService, JwtService, CloudinaryService, PrismaProfileService, PrismaProfileConnectionService, PrismaChatService, PrismaMessageService, RealtimeChatService, PrismaReportService, PrismaNotificationService } from '@/infrastructure/services';
import { CronService } from '@/infrastructure/services/cron.service';
import { ProfileConnectionCronService } from '@/infrastructure/services/profile-connection-cron.service';
import { ICronService } from '@/domain/services/cron.service.interface';
import { FirebaseService } from '@/infrastructure/services/FirebaseService';
import { PrismaEmailVerificationService } from '@/infrastructure/services/prisma-email-verification.service';
import { PrismaPasswordResetService } from '@/infrastructure/services/prisma-password-reset.service';
import { MailgunService, IEmailService } from '@/infrastructure/services/mailgun.service';
import { GmailService } from '@/infrastructure/services/gmail.service';
import { ResendService } from '@/infrastructure/services/resend.service';
import { IDatabaseService } from '@/shared/types';
import { HealthController, WelcomeController, DatabaseController, AccountController, ProfileController, QnAExamplesController, ProfileConnectionController, ChatController, ReportController, NotificationDataController } from '@/presentation/controllers';
import { EmailVerificationController } from '@/presentation/controllers/email-verification.controller';
import { PasswordResetController } from '@/presentation/controllers/password-reset.controller';
import { NotificationController } from '@/presentation/controllers/NotificationController';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes, AccountRoutes, ProfileRoutes, QnAExamplesRoutes, ProfileConnectionRoutes, ChatRoutes, ReportRoutes, NotificationDataRoutes } from '@/presentation/routes';
import { EmailVerificationRoutes } from '@/presentation/routes/email-verification.routes';
import { PasswordResetRoutes } from '@/presentation/routes/password-reset.routes';
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
    // Infrastructure - Create instances first
    const logger = new ConsoleLoggerService();
    const database = new DatabaseService();
    const prisma = PrismaService.getInstance();
    
    // Choose email service based on environment or configuration
    let emailService: IEmailService;
    try {
      if (process.env.RESEND_API_KEY) {
        emailService = new ResendService();
        logger.info('Using Resend email service');
      } else {
        emailService = new GmailService();
        logger.info('Using Gmail email service');
      }
    } catch (error) {
      logger.error('Failed to initialize email service, falling back to Gmail:', error);
      emailService = new GmailService();
    }
    
    const systemService = new SystemService();
    
    // Register base services
    this.services.set('logger', logger);
    this.services.set('database', database);
    this.services.set('prisma', prisma);
    this.services.set('emailService', emailService);
    this.services.set('systemRepository', systemService);
    
    // Register repositories that depend on prisma
    this.services.set('accountRepository', new PrismaAccountService(prisma));
    this.services.set('profileRepository', new PrismaProfileService(prisma));
    this.services.set('profileConnectionRepository', new PrismaProfileConnectionService(prisma));
    this.services.set('chatRepository', new PrismaChatService(prisma));
    this.services.set('messageRepository', new PrismaMessageService(prisma));
    this.services.set('emailVerificationRepository', new PrismaEmailVerificationService(prisma));
    this.services.set('passwordResetRepository', new PrismaPasswordResetService(prisma));
    this.services.set('reportRepository', new PrismaReportService(prisma));
    this.services.set('notificationRepository', new PrismaNotificationService(prisma));
    this.services.set('imageRepository', new CloudinaryService(logger));
    
    // Register other services
    const jwtService = new JwtService();
    const realtimeChatService = new RealtimeChatService();
    const firebaseService = new FirebaseService(logger);
    const cronService = new CronService(logger);
    
    this.services.set('jwtRepository', jwtService);
    this.services.set('realtimeChatService', realtimeChatService);
    this.services.set('firebaseService', firebaseService);
    this.services.set('cronService', cronService);
    this.services.set('profileConnectionCronService', new ProfileConnectionCronService(cronService, logger));

    // Get repository instances
    const accountRepository = this.services.get('accountRepository') as IAccountRepository;
    const profileRepository = this.services.get('profileRepository') as IProfileRepository;
    const profileConnectionRepository = this.services.get('profileConnectionRepository') as IProfileConnectionRepository;
    const chatRepository = this.services.get('chatRepository') as IChatRepository;
    const messageRepository = this.services.get('messageRepository') as IMessageRepository;
    const emailVerificationRepository = this.services.get('emailVerificationRepository') as IEmailVerificationRepository;
    const passwordResetRepository = this.services.get('passwordResetRepository') as IPasswordResetRepository;
    const reportRepository = this.services.get('reportRepository') as IReportRepository;
    const notificationRepository = this.services.get('notificationRepository') as INotificationRepository;
    const imageRepository = this.services.get('imageRepository') as IImageRepository;

    // Use Cases
    this.services.set('healthUseCase', new HealthUseCase(systemService));
    this.services.set('welcomeUseCase', new WelcomeUseCase());
    this.services.set('createAccountUseCase', new CreateAccountUseCase(accountRepository, jwtService));
    this.services.set('getAccountUseCase', new GetAccountUseCase(accountRepository));
    this.services.set('getAccountByEmailUseCase', new GetAccountByEmailUseCase(accountRepository));
    this.services.set('createAccountWithEmailPasswordUseCase', new CreateAccountWithEmailPasswordUseCase(accountRepository, jwtService));
    this.services.set('loginWithEmailPasswordUseCase', new LoginWithEmailPasswordUseCase(accountRepository, jwtService));
    this.services.set('deleteAccountUseCase', new DeleteAccountUseCase(accountRepository));
    this.services.set('refreshTokenUseCase', new RefreshTokenUseCase(jwtService));
    this.services.set('profileUseCase', new ProfileUseCase(profileRepository, imageRepository, profileConnectionRepository));
    this.services.set('emailVerificationUseCase', new EmailVerificationUseCase(
      emailVerificationRepository,
      profileRepository,
      emailService
    ));
    this.services.set('sendPasswordResetUseCase', new SendPasswordResetUseCase(
      passwordResetRepository,
      accountRepository,
      emailService
    ));
    this.services.set('verifyPasswordResetCodeUseCase', new VerifyPasswordResetCodeUseCase(
      passwordResetRepository
    ));
    this.services.set('resetPasswordUseCase', new ResetPasswordUseCase(
      passwordResetRepository,
      accountRepository
    ));
    this.services.set('qnaExamplesUseCase', new QnAExamplesUseCase());
    this.services.set('profileConnectionUseCase', new ProfileConnectionUseCase(
      profileConnectionRepository,
      profileRepository,
      firebaseService,
      reportRepository,
      notificationRepository
    ));
    this.services.set('createOrFindChatUseCase', new CreateOrFindChatUseCase(
      chatRepository,
      profileRepository
    ));
    this.services.set('getUserChatsUseCase', new GetUserChatsUseCase(
      chatRepository,
      profileRepository
    ));
    this.services.set('addMessageUseCase', new AddMessageUseCase(
      messageRepository,
      chatRepository,
      profileRepository,
      firebaseService
    ));
    this.services.set('updateMessageReadInfoUseCase', new UpdateMessageReadInfoUseCase(
      chatRepository
    ));
    this.services.set('getChatByIdUseCase', new GetChatByIdUseCase(
      chatRepository
    ));
    this.services.set('leaveChatUseCase', new LeaveChatUseCase(
      chatRepository,
      messageRepository
    ));
    this.services.set('createReportUseCase', new CreateReportUseCase(
      reportRepository,
      profileRepository
    ));
    this.services.set('getMyReportsUseCase', new GetMyReportsUseCase(
      reportRepository,
      profileRepository
    ));
    this.services.set('getReportsAgainstMeUseCase', new GetReportsAgainstMeUseCase(
      reportRepository,
      profileRepository
    ));
    this.services.set('notificationUseCase', new NotificationUseCase(firebaseService));
    this.services.set('notificationDataUseCase', new NotificationDataUseCase(notificationRepository));

    // Get Use Cases
    const healthUseCase = this.services.get('healthUseCase') as IHealthUseCase;
    const welcomeUseCase = this.services.get('welcomeUseCase') as IWelcomeUseCase;
    const createAccountUseCase = this.services.get('createAccountUseCase') as ICreateAccountUseCase;
    const getAccountUseCase = this.services.get('getAccountUseCase') as IGetAccountUseCase;
    const getAccountByEmailUseCase = this.services.get('getAccountByEmailUseCase') as IGetAccountByEmailUseCase;
    const createAccountWithEmailPasswordUseCase = this.services.get('createAccountWithEmailPasswordUseCase') as ICreateAccountWithEmailPasswordUseCase;
    const loginWithEmailPasswordUseCase = this.services.get('loginWithEmailPasswordUseCase') as ILoginWithEmailPasswordUseCase;
    const refreshTokenUseCase = this.services.get('refreshTokenUseCase') as IRefreshTokenUseCase;
    const deleteAccountUseCase = this.services.get('deleteAccountUseCase') as IDeleteAccountUseCase;
    const profileUseCase = this.services.get('profileUseCase') as IProfileUseCase;
    const emailVerificationUseCase = this.services.get('emailVerificationUseCase') as IEmailVerificationUseCase;
    const sendPasswordResetUseCase = this.services.get('sendPasswordResetUseCase') as ISendPasswordResetUseCase;
    const verifyPasswordResetCodeUseCase = this.services.get('verifyPasswordResetCodeUseCase') as IVerifyPasswordResetCodeUseCase;
    const resetPasswordUseCase = this.services.get('resetPasswordUseCase') as IResetPasswordUseCase;

    // Controllers
    this.services.set('healthController', new HealthController(healthUseCase));
    this.services.set('welcomeController', new WelcomeController(welcomeUseCase));
    this.services.set('databaseController', new DatabaseController(database));
    this.services.set('accountController', new AccountController(
      createAccountUseCase,
      getAccountUseCase,
      getAccountByEmailUseCase,
      createAccountWithEmailPasswordUseCase,
      loginWithEmailPasswordUseCase,
      refreshTokenUseCase,
      deleteAccountUseCase
    ));
    this.services.set('profileController', new ProfileController(profileUseCase));
    this.services.set('emailVerificationController', new EmailVerificationController(emailVerificationUseCase));
    this.services.set('passwordResetController', new PasswordResetController(
      sendPasswordResetUseCase,
      verifyPasswordResetCodeUseCase,
      resetPasswordUseCase
    ));
    // Get more Use Cases
    const qnaExamplesUseCase = this.services.get('qnaExamplesUseCase') as IQnAExamplesUseCase;
    const profileConnectionUseCase = this.services.get('profileConnectionUseCase') as IProfileConnectionUseCase;
    const createOrFindChatUseCase = this.services.get('createOrFindChatUseCase') as ICreateOrFindChatUseCase;
    const getUserChatsUseCase = this.services.get('getUserChatsUseCase') as IGetUserChatsUseCase;
    const addMessageUseCase = this.services.get('addMessageUseCase') as IAddMessageUseCase;
    const updateMessageReadInfoUseCase = this.services.get('updateMessageReadInfoUseCase') as IUpdateMessageReadInfoUseCase;
    const getChatByIdUseCase = this.services.get('getChatByIdUseCase') as IGetChatByIdUseCase;
    const leaveChatUseCase = this.services.get('leaveChatUseCase') as ILeaveChatUseCase;
    const createReportUseCase = this.services.get('createReportUseCase') as ICreateReportUseCase;
    const getMyReportsUseCase = this.services.get('getMyReportsUseCase') as IGetMyReportsUseCase;
    const getReportsAgainstMeUseCase = this.services.get('getReportsAgainstMeUseCase') as IGetReportsAgainstMeUseCase;
    const notificationUseCase = this.services.get('notificationUseCase') as INotificationUseCase;
    const notificationDataUseCase = this.services.get('notificationDataUseCase') as INotificationDataUseCase;

    this.services.set('qnaExamplesController', new QnAExamplesController(qnaExamplesUseCase));
    this.services.set('profileConnectionController', new ProfileConnectionController(profileConnectionUseCase));
    this.services.set('chatController', new ChatController(
      createOrFindChatUseCase,
      getUserChatsUseCase,
      addMessageUseCase,
      updateMessageReadInfoUseCase,
      getAccountUseCase,
      getChatByIdUseCase,
      leaveChatUseCase,
      realtimeChatService
    ));
    this.services.set('reportController', new ReportController(
      createReportUseCase,
      getMyReportsUseCase,
      getReportsAgainstMeUseCase
    ));
    this.services.set('notificationController', new NotificationController(notificationUseCase));
    this.services.set('notificationDataController', new NotificationDataController(
      notificationDataUseCase,
      profileRepository
    ));

    // Middlewares
    this.services.set('errorMiddleware', new ErrorMiddleware(logger));

    // Get Controllers
    const healthController = this.services.get('healthController') as HealthController;
    const welcomeController = this.services.get('welcomeController') as WelcomeController;
    const databaseController = this.services.get('databaseController') as DatabaseController;
    const accountController = this.services.get('accountController') as AccountController;
    const profileController = this.services.get('profileController') as ProfileController;
    const emailVerificationController = this.services.get('emailVerificationController') as EmailVerificationController;
    const passwordResetController = this.services.get('passwordResetController') as PasswordResetController;
    const qnaExamplesController = this.services.get('qnaExamplesController') as QnAExamplesController;
    const profileConnectionController = this.services.get('profileConnectionController') as ProfileConnectionController;
    const chatController = this.services.get('chatController') as ChatController;
    const reportController = this.services.get('reportController') as ReportController;
    const notificationController = this.services.get('notificationController') as NotificationController;
    const notificationDataController = this.services.get('notificationDataController') as NotificationDataController;

    // Routes
    this.services.set('healthRoutes', new HealthRoutes(healthController));
    this.services.set('welcomeRoutes', new WelcomeRoutes(welcomeController));
    this.services.set('databaseRoutes', new DatabaseRoutes(databaseController));
    this.services.set('accountRoutes', new AccountRoutes(accountController));
    this.services.set('profileRoutes', new ProfileRoutes(profileController));
    this.services.set('emailVerificationRoutes', new EmailVerificationRoutes(emailVerificationController));
    this.services.set('passwordResetRoutes', new PasswordResetRoutes(passwordResetController));
    this.services.set('qnaExamplesRoutes', new QnAExamplesRoutes(qnaExamplesController));
    this.services.set('profileConnectionRoutes', new ProfileConnectionRoutes(profileConnectionController));
    this.services.set('chatRoutes', new ChatRoutes(chatController));
    this.services.set('reportRoutes', new ReportRoutes(reportController));
    this.services.set('notificationRoutes', new NotificationRoutes(notificationController, firebaseService));
    this.services.set('notificationDataRoutes', new NotificationDataRoutes(notificationDataController));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
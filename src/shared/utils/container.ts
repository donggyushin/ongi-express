import { HealthUseCase, WelcomeUseCase, IHealthUseCase, IWelcomeUseCase, CreateAccountUseCase, ICreateAccountUseCase, GetAccountUseCase, IGetAccountUseCase, RefreshTokenUseCase, IRefreshTokenUseCase, ProfileUseCase, IProfileUseCase } from '@/domain/use-cases';
import { EmailVerificationUseCase, IEmailVerificationUseCase } from '@/domain/use-cases/email-verification.use-case';
import { IAccountRepository, ISystemRepository, IJwtRepository, IImageRepository, IProfileRepository, IEmailVerificationRepository } from '@/domain/repositories';
import { ConsoleLoggerService, ILoggerService, DatabaseService, SystemService, PrismaService, PrismaAccountService, JwtService, CloudinaryService, PrismaProfileService } from '@/infrastructure/services';
import { PrismaEmailVerificationService } from '@/infrastructure/services/prisma-email-verification.service';
import { MailgunService, IEmailService } from '@/infrastructure/services/mailgun.service';
import { IDatabaseService } from '@/shared/types';
import { HealthController, WelcomeController, DatabaseController, AccountController, ProfileController } from '@/presentation/controllers';
import { EmailVerificationController } from '@/presentation/controllers/email-verification.controller';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes, AccountRoutes, ProfileRoutes } from '@/presentation/routes';
import { EmailVerificationRoutes } from '@/presentation/routes/email-verification.routes';

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
    this.services.set('emailVerificationRepository', new PrismaEmailVerificationService(this.get('prisma')));
    this.services.set('imageRepository', new CloudinaryService(this.get<ILoggerService>('logger')));
    this.services.set('emailService', new MailgunService());
    this.services.set('systemRepository', new SystemService());
    this.services.set('jwtRepository', new JwtService());

    // Use Cases
    this.services.set('healthUseCase', new HealthUseCase(this.get<ISystemRepository>('systemRepository')));
    this.services.set('welcomeUseCase', new WelcomeUseCase());
    this.services.set('createAccountUseCase', new CreateAccountUseCase(
      this.get<IAccountRepository>('accountRepository'),
      this.get<IJwtRepository>('jwtRepository')
    ));
    this.services.set('getAccountUseCase', new GetAccountUseCase(this.get<IAccountRepository>('accountRepository')));
    this.services.set('refreshTokenUseCase', new RefreshTokenUseCase(this.get<IJwtRepository>('jwtRepository')));
    this.services.set('profileUseCase', new ProfileUseCase(
      this.get<IProfileRepository>('profileRepository'),
      this.get<IImageRepository>('imageRepository')
    ));
    this.services.set('emailVerificationUseCase', new EmailVerificationUseCase(
      this.get<IEmailVerificationRepository>('emailVerificationRepository'),
      this.get<IProfileRepository>('profileRepository'),
      this.get<IEmailService>('emailService')
    ));

    // Controllers
    this.services.set('healthController', new HealthController(this.get<IHealthUseCase>('healthUseCase')));
    this.services.set('welcomeController', new WelcomeController(this.get<IWelcomeUseCase>('welcomeUseCase')));
    this.services.set('databaseController', new DatabaseController(this.get<IDatabaseService>('database')));
    this.services.set('accountController', new AccountController(
      this.get<ICreateAccountUseCase>('createAccountUseCase'),
      this.get<IGetAccountUseCase>('getAccountUseCase'),
      this.get<IRefreshTokenUseCase>('refreshTokenUseCase')
    ));
    this.services.set('profileController', new ProfileController(this.get<IProfileUseCase>('profileUseCase')));
    this.services.set('emailVerificationController', new EmailVerificationController(this.get<IEmailVerificationUseCase>('emailVerificationUseCase')));

    // Middlewares
    this.services.set('errorMiddleware', new ErrorMiddleware(this.get<ILoggerService>('logger')));

    // Routes
    this.services.set('healthRoutes', new HealthRoutes(this.get<HealthController>('healthController')));
    this.services.set('welcomeRoutes', new WelcomeRoutes(this.get<WelcomeController>('welcomeController')));
    this.services.set('databaseRoutes', new DatabaseRoutes(this.get<DatabaseController>('databaseController')));
    this.services.set('accountRoutes', new AccountRoutes(this.get<AccountController>('accountController')));
    this.services.set('profileRoutes', new ProfileRoutes(this.get<ProfileController>('profileController')));
    this.services.set('emailVerificationRoutes', new EmailVerificationRoutes(this.get<EmailVerificationController>('emailVerificationController')));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
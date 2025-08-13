import { HealthUseCase, WelcomeUseCase, IHealthUseCase, IWelcomeUseCase } from '@/domain/use-cases';
import { ConsoleLoggerService, ILoggerService, DatabaseService } from '@/infrastructure/services';
import { IDatabaseService } from '@/shared/types';
import { HealthController, WelcomeController, DatabaseController } from '@/presentation/controllers';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes, DatabaseRoutes } from '@/presentation/routes';

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

    // Use Cases
    this.services.set('healthUseCase', new HealthUseCase());
    this.services.set('welcomeUseCase', new WelcomeUseCase());

    // Controllers
    this.services.set('healthController', new HealthController(this.get<IHealthUseCase>('healthUseCase')));
    this.services.set('welcomeController', new WelcomeController(this.get<IWelcomeUseCase>('welcomeUseCase')));
    this.services.set('databaseController', new DatabaseController(this.get<IDatabaseService>('database')));

    // Middlewares
    this.services.set('errorMiddleware', new ErrorMiddleware(this.get<ILoggerService>('logger')));

    // Routes
    this.services.set('healthRoutes', new HealthRoutes(this.get<HealthController>('healthController')));
    this.services.set('welcomeRoutes', new WelcomeRoutes(this.get<WelcomeController>('welcomeController')));
    this.services.set('databaseRoutes', new DatabaseRoutes(this.get<DatabaseController>('databaseController')));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
import { HealthUseCase, WelcomeUseCase, IHealthUseCase, IWelcomeUseCase } from '@/domain/use-cases';
import { ConsoleLoggerService, ILoggerService } from '@/infrastructure/services';
import { HealthController, WelcomeController } from '@/presentation/controllers';
import { ErrorMiddleware } from '@/presentation/middlewares';
import { HealthRoutes, WelcomeRoutes } from '@/presentation/routes';

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

    // Use Cases
    this.services.set('healthUseCase', new HealthUseCase());
    this.services.set('welcomeUseCase', new WelcomeUseCase());

    // Controllers
    this.services.set('healthController', new HealthController(this.get<IHealthUseCase>('healthUseCase')));
    this.services.set('welcomeController', new WelcomeController(this.get<IWelcomeUseCase>('welcomeUseCase')));

    // Middlewares
    this.services.set('errorMiddleware', new ErrorMiddleware(this.get<ILoggerService>('logger')));

    // Routes
    this.services.set('healthRoutes', new HealthRoutes(this.get<HealthController>('healthController')));
    this.services.set('welcomeRoutes', new WelcomeRoutes(this.get<WelcomeController>('welcomeController')));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
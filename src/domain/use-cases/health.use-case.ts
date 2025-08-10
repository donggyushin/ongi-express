import { HealthStatus } from '@/domain/entities';

export interface IHealthUseCase {
  getHealthStatus(): HealthStatus;
}

export class HealthUseCase implements IHealthUseCase {
  getHealthStatus(): HealthStatus {
    return new HealthStatus('OK', process.uptime());
  }
}
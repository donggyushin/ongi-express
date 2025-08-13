import { HealthStatus } from '@/domain/entities';
import { ISystemRepository } from '@/domain/repositories';

export interface IHealthUseCase {
  getHealthStatus(): HealthStatus;
}

export class HealthUseCase implements IHealthUseCase {
  constructor(private systemRepository: ISystemRepository) {}

  getHealthStatus(): HealthStatus {
    const uptime = this.systemRepository.getUptime();
    return new HealthStatus('OK', uptime);
  }
}
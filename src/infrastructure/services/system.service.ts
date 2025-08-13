import { ISystemRepository } from '@/domain/repositories';

export class SystemService implements ISystemRepository {
  getUptime(): number {
    return process.uptime();
  }
}
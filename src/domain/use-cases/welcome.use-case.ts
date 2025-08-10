import { WelcomeResponse } from '@/shared/types';

export interface IWelcomeUseCase {
  getWelcomeMessage(): WelcomeResponse;
}

export class WelcomeUseCase implements IWelcomeUseCase {
  getWelcomeMessage(): WelcomeResponse {
    return {
      message: 'Welcome to Ongi API',
      status: 'Running',
      timestamp: new Date().toISOString()
    };
  }
}
import { WelcomeMessage } from '@/domain/entities';

export interface IWelcomeUseCase {
  getWelcomeMessage(): WelcomeMessage;
}

export class WelcomeUseCase implements IWelcomeUseCase {
  getWelcomeMessage(): WelcomeMessage {
    return new WelcomeMessage('Welcome to Ongi API', 'Running');
  }
}
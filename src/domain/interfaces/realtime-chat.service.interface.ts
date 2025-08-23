import { Server } from 'socket.io';

export interface IRealtimeChatService {
  initialize(server: any): void;
  joinChat(socketId: string, chatId: string): void;
  leaveChat(socketId: string, chatId: string): void;
  broadcastMessage(chatId: string, message: {
    id: string;
    writerProfileId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }): void;
  getSocketServer(): Server | null;
}
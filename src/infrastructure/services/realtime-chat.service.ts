import { Server, Socket } from 'socket.io';
import { IRealtimeChatService } from '@/domain/interfaces/realtime-chat.service.interface';

export class RealtimeChatService implements IRealtimeChatService {
  private io: Server | null = null;
  private userSocketMap: Map<string, string> = new Map(); // socketId -> chatId
  
  initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join-chat', (chatId: string) => {
        this.joinChat(socket.id, chatId);
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
      });

      socket.on('leave-chat', (chatId: string) => {
        this.leaveChat(socket.id, chatId);
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat: ${chatId}`);
      });

      socket.on('send-message', (data: {
        chatId: string;
        message: {
          id: string;
          writerProfileId: string;
          text: string;
          createdAt: string;
          updatedAt: string;
        };
      }) => {
        this.broadcastMessage(data.chatId, data.message);
      });

      socket.on('disconnect', () => {
        const chatId = this.userSocketMap.get(socket.id);
        if (chatId) {
          this.leaveChat(socket.id, chatId);
        }
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  joinChat(socketId: string, chatId: string): void {
    this.userSocketMap.set(socketId, chatId);
  }

  leaveChat(socketId: string, chatId: string): void {
    this.userSocketMap.delete(socketId);
  }

  broadcastMessage(chatId: string, message: {
    id: string;
    writerProfileId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    if (!this.io) {
      console.error('Socket.io server not initialized');
      return;
    }

    this.io.to(chatId).emit('message', { message });
    console.log(`Message broadcasted to chat ${chatId}:`, message);
  }

  getSocketServer(): Server | null {
    return this.io;
  }
}
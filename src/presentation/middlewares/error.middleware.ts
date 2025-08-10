import { Request, Response, NextFunction } from 'express';
import { ILoggerService } from '@/infrastructure/services';
import { ApiResponse } from '@/shared/types';

export class ErrorMiddleware {
  constructor(private readonly logger: ILoggerService) {}

  handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    this.logger.error(`Error occurred: ${err.message}`, err);

    const response: ApiResponse = {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message
    };

    res.status(500).json(response);
  }

  notFound(req: Request, res: Response): void {
    const response: ApiResponse = {
      success: false,
      error: 'Not Found',
      message: 'The requested resource was not found on this server.'
    };

    res.status(404).json(response);
  }
}
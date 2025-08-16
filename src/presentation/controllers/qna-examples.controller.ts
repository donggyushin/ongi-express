import { Request, Response } from 'express';
import { IQnAExamplesUseCase } from '@/domain/use-cases';
import { ApiResponse } from '@/shared/types';

export class QnAExamplesController {
  constructor(private readonly qnaExamplesUseCase: IQnAExamplesUseCase) {}

  async getExamples(req: Request, res: Response): Promise<void> {
    try {
      const examples = this.qnaExamplesUseCase.getExamples();
      const response: ApiResponse<any[]> = {
        success: true,
        data: examples.map(qna => qna.toJSON())
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get QnA examples'
      };
      
      res.status(500).json(response);
    }
  }
}
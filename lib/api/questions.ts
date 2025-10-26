import { apiClient } from './client';
import type { Question } from '@/types';

export const questionsApi = {
  create: (data: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> =>
    apiClient.post('/questions', data),

  update: (id: number, data: Partial<Question>): Promise<Question> =>
    apiClient.put(`/questions/${id}`, data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/questions/${id}`),

  reorder: (surveyId: number, questionIds: number[]): Promise<void> =>
    apiClient.put(`/surveys/${surveyId}/questions/reorder`, { question_ids: questionIds }),
};

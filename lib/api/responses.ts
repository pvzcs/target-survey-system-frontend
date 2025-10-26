import { apiClient } from './client';
import type { PublicSurveyData, Answer } from '@/types';

export const responsesApi = {
  getSurvey: (id: number, token: string): Promise<PublicSurveyData> =>
    apiClient.get(`/public/surveys/${id}`, { params: { token } }),

  submit: (token: string, answers: Answer[]): Promise<void> =>
    apiClient.post('/public/responses', { token, answers }),
};

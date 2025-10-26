import { apiClient } from './client';
import type { Survey, Response, Statistics, ShareLink } from '@/types';

export const surveysApi = {
  list: (page = 1, pageSize = 20): Promise<Survey[]> =>
    apiClient.get('/surveys', { params: { page, page_size: pageSize } }),

  get: (id: number): Promise<Survey> =>
    apiClient.get(`/surveys/${id}`),

  create: (data: { title: string; description?: string }): Promise<Survey> =>
    apiClient.post('/surveys', data),

  update: (id: number, data: { title: string; description?: string }): Promise<Survey> =>
    apiClient.put(`/surveys/${id}`, data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/surveys/${id}`),

  publish: (id: number): Promise<void> =>
    apiClient.post(`/surveys/${id}/publish`),

  share: (
    id: number,
    data: { prefill_data?: Record<string, string>; expires_at?: string }
  ): Promise<ShareLink> =>
    apiClient.post(`/surveys/${id}/share`, data),

  getResponses: (id: number, page = 1, pageSize = 20): Promise<Response[]> =>
    apiClient.get(`/surveys/${id}/responses`, { params: { page, page_size: pageSize } }),

  getStatistics: (id: number): Promise<Statistics> =>
    apiClient.get(`/surveys/${id}/statistics`),

  export: (id: number, format: 'csv' | 'excel'): Promise<Blob> =>
    apiClient.get(`/surveys/${id}/export`, { params: { format }, responseType: 'blob' }),
};

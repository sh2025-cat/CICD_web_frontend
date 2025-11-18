import apiClient from '@/api/client';
import type { ApiResponse } from '@/types';

// Example service for API calls
export const exampleService = {
  // GET example
  getAll: async <T>() => {
    const response = await apiClient.get<ApiResponse<T[]>>('/api/example');
    return response.data;
  },

  // GET by ID example
  getById: async <T>(id: string | number) => {
    const response = await apiClient.get<ApiResponse<T>>(`/api/example/${id}`);
    return response.data;
  },

  // POST example
  create: async <T>(data: Partial<T>) => {
    const response = await apiClient.post<ApiResponse<T>>('/api/example', data);
    return response.data;
  },

  // PUT example
  update: async <T>(id: string | number, data: Partial<T>) => {
    const response = await apiClient.put<ApiResponse<T>>(`/api/example/${id}`, data);
    return response.data;
  },

  // DELETE example
  delete: async (id: string | number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/example/${id}`);
    return response.data;
  },
};

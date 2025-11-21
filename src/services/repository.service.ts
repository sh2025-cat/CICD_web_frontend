import { mockRepositories } from '@/lib/mock-data';
import type { Repository } from '@/lib/mock-data';
import apiClient from '@/api/client';

export async function getRepositories(): Promise<Repository[]> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return mockRepositories;
    }

    const response = await apiClient.get<{ data: Repository[] }>('/api/repositories');
    return response.data.data;
}

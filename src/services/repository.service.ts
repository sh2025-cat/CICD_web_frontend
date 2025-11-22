import { mockRepositories, mockDeploymentList } from '@/lib/mock-data';
import type { Repository, DeploymentListItem } from '@/lib/mock-data';
import apiClient from '@/api/client';

export async function getRepositories(): Promise<Repository[]> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return mockRepositories;
    }

    const response = await apiClient.get<{ data: Repository[] }>('/api/repos');
    return response.data.data;
}

export async function getRepositoryById(projectId: number): Promise<Repository | undefined> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return mockRepositories.find(r => r.id === projectId);
    }

    const response = await apiClient.get<{ data: Repository }>(`/api/repos/${projectId}`);
    return response.data.data;
}

export async function getDeploymentsByRepoId(projectId: number): Promise<DeploymentListItem[]> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return mockDeploymentList[projectId] || [];
    }

    const response = await apiClient.get<{ data: DeploymentListItem[] }>(`/api/repos/${projectId}/deployments`);
    return response.data.data;
}

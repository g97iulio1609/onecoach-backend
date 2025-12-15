import { apiClient } from './client';
export const milestonesApi = {
    create: async (input) => {
        const response = await apiClient.post('/api/milestones', input);
        return response;
    },
    update: async (id, input) => {
        const response = await apiClient.patch('/api/milestones', { id, ...input });
        return response;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/milestones?id=${id}`);
    },
};

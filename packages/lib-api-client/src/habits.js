import { apiClient } from './client';
export const habitsApi = {
    getAll: async () => {
        const data = await apiClient.get('/api/habits');
        return data;
    },
    getById: async (id) => {
        const data = await apiClient.get(`/api/habits/${id}`);
        return data;
    },
    create: async (input) => {
        const data = await apiClient.post('/api/habits', input);
        return data;
    },
    update: async (id, input) => {
        const data = await apiClient.patch(`/api/habits/${id}`, input);
        return data;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/habits/${id}`);
    },
    toggle: async (id) => {
        const data = await apiClient.post(`/api/habits/${id}/toggle`, {});
        return data;
    },
};

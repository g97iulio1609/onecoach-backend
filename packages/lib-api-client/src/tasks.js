import { apiClient } from './client';
export const tasksApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/tasks');
        return response.tasks || [];
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/tasks/${id}`);
        return response.task;
    },
    create: async (input) => {
        const response = await apiClient.post('/api/tasks', {
            ...input,
            dueDate: input.dueDate?.toISOString(),
        });
        return response;
    },
    update: async (id, input) => {
        const response = await apiClient.patch('/api/tasks', { id, ...input });
        return response;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/tasks?id=${id}`);
    },
    reorder: async (tasks) => {
        await apiClient.post('/api/tasks/reorder', { tasks });
    },
};

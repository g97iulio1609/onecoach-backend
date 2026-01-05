import { apiClient } from './client';
export const projectsApi = {
    getAll: async () => {
        return apiClient.get('/api/projects');
    },
    getById: async (id) => {
        return apiClient.get(`/api/projects/${id}`);
    },
    create: async (input) => {
        const response = await apiClient.post('/api/projects', {
            ...input,
            startDate: input.startDate?.toISOString(),
            dueDate: input.dueDate?.toISOString(),
        });
        return response.project;
    },
    update: async (id, input) => {
        const response = await apiClient.patch('/api/projects', {
            id,
            ...input,
            startDate: input.startDate?.toISOString(),
            dueDate: input.dueDate?.toISOString(),
        });
        return response.project;
    },
    delete: async (id) => {
        await apiClient.delete(`/api/projects?id=${id}`);
    },
    duplicate: async (id) => {
        const response = await apiClient.post(`/api/projects/${id}/duplicate`, {});
        return response.project;
    },
};
// NOTE: tasksApi and milestonesApi are now in their own files (tasks.ts, milestones.ts)
// This avoids duplication and keeps SSOT

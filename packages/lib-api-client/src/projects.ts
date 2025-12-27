import { apiClient } from './client';
import type { Project, CreateProjectInput as TypesCreateProjectInput } from '@onecoach/types';

export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectResponse {
  project: Project;
}

export type CreateProjectInput = TypesCreateProjectInput;

export const projectsApi = {
  getAll: async (): Promise<ProjectsResponse> => {
    return apiClient.get<ProjectsResponse>('/api/projects');
  },

  getById: async (id: string): Promise<ProjectResponse> => {
    return apiClient.get<ProjectResponse>(`/api/projects/${id}`);
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post<ProjectResponse>('/api/projects', {
      ...input,
      startDate: input.startDate?.toISOString(),
      dueDate: input.dueDate?.toISOString(),
    });
    return response.project;
  },

  update: async (id: string, input: Partial<CreateProjectInput>): Promise<Project> => {
    const response = await apiClient.patch<ProjectResponse>('/api/projects', {
      id,
      ...input,
      startDate: input.startDate?.toISOString(),
      dueDate: input.dueDate?.toISOString(),
    });
    return response.project;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects?id=${id}`);
  },

  duplicate: async (id: string): Promise<ProjectResponse & { message: string }> => {
    return apiClient.post<ProjectResponse & { message: string }>(`/api/projects/${id}/duplicate`, {});
  },
};

// NOTE: tasksApi and milestonesApi are now in their own files (tasks.ts, milestones.ts)
// This avoids duplication and keeps SSOT

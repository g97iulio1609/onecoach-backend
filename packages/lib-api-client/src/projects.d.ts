import type { Project, CreateProjectInput as TypesCreateProjectInput } from '@onecoach/types';
export interface ProjectsResponse {
    projects: Project[];
}
export interface ProjectResponse {
    project: Project;
}
export type CreateProjectInput = TypesCreateProjectInput;
export declare const projectsApi: {
    getAll: () => Promise<ProjectsResponse>;
    getById: (id: string) => Promise<ProjectResponse>;
    create: (input: CreateProjectInput) => Promise<Project>;
    update: (id: string, input: Partial<CreateProjectInput>) => Promise<Project>;
    delete: (id: string) => Promise<void>;
    duplicate: (id: string) => Promise<Project>;
};
//# sourceMappingURL=projects.d.ts.map
/**
 * Projects React Query Hooks
 *
 * Custom hooks for projects with TanStack Query
 */
import { type CreateProjectInput } from '../projects';
/**
 * Query keys for projects
 */
export declare const projectsKeys: {
    all: readonly ["projects"];
    lists: () => readonly ["projects", "list"];
    list: (filters?: Record<string, unknown>) => readonly ["projects", "list", Record<string, unknown>];
    details: () => readonly ["projects", "detail"];
    detail: (id: string) => readonly ["projects", "detail", string];
};
/**
 * Hook to get all projects
 */
export declare function useProjects(): import("@tanstack/react-query").UseQueryResult<import("../projects").ProjectsResponse, Error>;
/**
 * Hook to get a single project by ID
 */
export declare function useProject(id: string | null): import("@tanstack/react-query").UseQueryResult<import("../projects").ProjectResponse, Error>;
/**
 * Hook to create a project
 */
export declare function useCreateProject(): import("@tanstack/react-query").UseMutationResult<import("@onecoach/types").Project, Error, import("@onecoach/types").CreateProjectInput, unknown>;
/**
 * Hook to update a project
 */
export declare function useUpdateProject(): import("@tanstack/react-query").UseMutationResult<import("@onecoach/types").Project, Error, {
    id: string;
    input: Partial<CreateProjectInput>;
}, unknown>;
/**
 * Hook to delete a project
 */
export declare function useDeleteProject(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
//# sourceMappingURL=use-projects.d.ts.map
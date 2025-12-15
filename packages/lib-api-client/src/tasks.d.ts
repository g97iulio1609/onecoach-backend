import type { Task } from '@onecoach/types';
export interface TaskResponse {
    task: Task;
}
export interface TasksResponse {
    tasks: Task[];
}
export declare const tasksApi: {
    getAll: () => Promise<Task[]>;
    getById: (id: string) => Promise<Task>;
    create: (input: {
        projectId: string;
        title: string;
        description?: string;
        milestoneId?: string;
        parentId?: string;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        dueDate?: Date;
        dependencies?: string[];
    }) => Promise<Task>;
    update: (id: string, input: Partial<{
        title: string;
        description: string;
        status: "TODO" | "IN_PROGRESS" | "DONE";
        priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        dueDate: string;
        milestoneId: string;
        parentId: string;
        order: number;
        dependencies: string[];
    }>) => Promise<Task>;
    delete: (id: string) => Promise<void>;
    reorder: (tasks: Array<{
        id: string;
        order: number;
    }>) => Promise<void>;
};
//# sourceMappingURL=tasks.d.ts.map
import type { Milestone } from '@onecoach/types';
export interface MilestoneResponse {
    milestone: Milestone;
}
export interface MilestonesResponse {
    milestones: Milestone[];
}
export declare const milestonesApi: {
    create: (input: {
        projectId: string;
        name: string;
        description?: string;
        dueDate?: string;
        order?: number;
        dependencies?: string[];
    }) => Promise<Milestone>;
    update: (id: string, input: Partial<{
        name: string;
        description: string;
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
        dueDate: string;
        order: number;
        dependencies: string[];
    }>) => Promise<Milestone>;
    delete: (id: string) => Promise<void>;
};
//# sourceMappingURL=milestones.d.ts.map
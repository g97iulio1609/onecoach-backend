/**
 * Visual Builder React Hooks
 * Custom hooks for API interactions
 */
import type { Workflow, SkillFormData, WorkflowFormData, NodeFormData, EdgeFormData, CodeGenerationResult } from './types';
export declare function useSkills(): {
    skills: {
        name: string;
        id: string;
        description: string | null;
        version: string;
        category: string | null;
        tags: import(".prisma/client/runtime/client").JsonValue | null;
        inputSchema: import(".prisma/client/runtime/client").JsonValue;
        outputSchema: import(".prisma/client/runtime/client").JsonValue | null;
        implementation: import(".prisma/client/runtime/client").JsonValue;
        generatedCode: string | null;
        codeHash: string | null;
        isPublic: boolean;
        isActive: boolean;
        deployedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }[];
    loading: boolean;
    error: string | null;
    fetchSkills: (includePublic?: boolean) => Promise<void>;
    createSkill: (data: SkillFormData) => Promise<{
        name: string;
        id: string;
        description: string | null;
        version: string;
        category: string | null;
        tags: import(".prisma/client/runtime/client").JsonValue | null;
        inputSchema: import(".prisma/client/runtime/client").JsonValue;
        outputSchema: import(".prisma/client/runtime/client").JsonValue | null;
        implementation: import(".prisma/client/runtime/client").JsonValue;
        generatedCode: string | null;
        codeHash: string | null;
        isPublic: boolean;
        isActive: boolean;
        deployedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    updateSkill: (skillId: string, data: Partial<SkillFormData>) => Promise<{
        name: string;
        id: string;
        description: string | null;
        version: string;
        category: string | null;
        tags: import(".prisma/client/runtime/client").JsonValue | null;
        inputSchema: import(".prisma/client/runtime/client").JsonValue;
        outputSchema: import(".prisma/client/runtime/client").JsonValue | null;
        implementation: import(".prisma/client/runtime/client").JsonValue;
        generatedCode: string | null;
        codeHash: string | null;
        isPublic: boolean;
        isActive: boolean;
        deployedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    deleteSkill: (skillId: string) => Promise<void>;
    deploySkill: (skillId: string) => Promise<{
        name: string;
        id: string;
        description: string | null;
        version: string;
        category: string | null;
        tags: import(".prisma/client/runtime/client").JsonValue | null;
        inputSchema: import(".prisma/client/runtime/client").JsonValue;
        outputSchema: import(".prisma/client/runtime/client").JsonValue | null;
        implementation: import(".prisma/client/runtime/client").JsonValue;
        generatedCode: string | null;
        codeHash: string | null;
        isPublic: boolean;
        isActive: boolean;
        deployedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    generateCode: (skillId: string) => Promise<CodeGenerationResult>;
};
export declare function useWorkflows(): {
    workflows: Workflow[];
    loading: boolean;
    error: string | null;
    fetchWorkflows: (includePublic?: boolean) => Promise<void>;
    fetchWorkflow: (workflowId: string) => Promise<Workflow>;
    createWorkflow: (data: WorkflowFormData) => Promise<Workflow>;
    updateWorkflow: (workflowId: string, data: Partial<WorkflowFormData>) => Promise<Workflow>;
    deleteWorkflow: (workflowId: string) => Promise<void>;
    deployWorkflow: (workflowId: string) => Promise<Workflow>;
    generateCode: (workflowId: string) => Promise<CodeGenerationResult>;
    addNode: (workflowId: string, data: NodeFormData) => Promise<any>;
    updateNode: (workflowId: string, nodeId: string, data: Partial<NodeFormData>) => Promise<any>;
    deleteNode: (workflowId: string, nodeId: string) => Promise<void>;
    addEdge: (workflowId: string, data: EdgeFormData) => Promise<any>;
    deleteEdge: (workflowId: string, edgeId: string) => Promise<void>;
};
//# sourceMappingURL=hooks.d.ts.map
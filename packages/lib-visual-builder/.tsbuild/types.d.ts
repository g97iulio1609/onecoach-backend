/**
 * Visual Builder Types
 * Shared types for frontend and backend
 */
import type { user_skills, user_workflows, workflow_nodes, workflow_edges } from '@prisma/client';
export type Skill = user_skills;
export type Workflow = user_workflows & {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
};
export type WorkflowNode = workflow_nodes;
export type WorkflowEdge = workflow_edges;
export type NodeType = 'agent' | 'skill' | 'decision' | 'loop' | 'condition';
export interface SkillFormData {
    name: string;
    description?: string;
    version?: string;
    category?: string;
    tags?: string[];
    inputSchema: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    implementation: Record<string, unknown>;
    isPublic?: boolean;
}
export interface WorkflowFormData {
    name: string;
    description?: string;
    version?: string;
    domain?: string;
    entryNodeId?: string;
    isPublic?: boolean;
}
export interface NodeFormData {
    type: NodeType;
    label: string;
    position: {
        x: number;
        y: number;
    };
    config: Record<string, unknown>;
    order?: number;
}
export interface EdgeFormData {
    sourceId: string;
    targetId: string;
    label?: string;
    condition?: Record<string, unknown>;
    order?: number;
}
export interface CodeGenerationResult {
    code: string;
    hash: string;
}
//# sourceMappingURL=types.d.ts.map
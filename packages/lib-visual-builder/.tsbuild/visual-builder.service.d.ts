/**
 * Visual Builder Service
 *
 * Manages user-created skills and workflows for the visual builder system.
 * Handles CRUD operations, code generation, and deployment.
 */
import type { user_skills, user_workflows, workflow_nodes, workflow_edges } from '@prisma/client';
/**
 * Skill input data for creation/update
 */
export interface SkillInput {
    name: string;
    description?: string;
    version?: string;
    category?: string;
    tags?: string[];
    inputSchema: unknown;
    outputSchema?: unknown;
    implementation: unknown;
    isPublic?: boolean;
}
/**
 * Workflow input data for creation/update
 */
export interface WorkflowInput {
    name: string;
    description?: string;
    version?: string;
    domain?: string;
    entryNodeId?: string;
    isPublic?: boolean;
}
/**
 * Workflow node input
 */
export interface WorkflowNodeInput {
    type: string;
    label: string;
    position: {
        x: number;
        y: number;
    };
    config: unknown;
    order?: number;
}
/**
 * Workflow edge input
 */
export interface WorkflowEdgeInput {
    sourceId: string;
    targetId: string;
    label?: string;
    condition?: unknown;
    order?: number;
}
/**
 * Visual Builder Service
 */
export declare class VisualBuilderService {
    /**
     * Create a new user skill
     */
    static createSkill(userId: string, data: SkillInput): Promise<user_skills>;
    /**
     * Update an existing user skill
     */
    static updateSkill(skillId: string, userId: string, data: Partial<SkillInput>): Promise<user_skills>;
    /**
     * Delete a user skill
     */
    static deleteSkill(skillId: string, userId: string): Promise<void>;
    /**
     * Get skill by ID
     */
    static getSkill(skillId: string, userId: string): Promise<user_skills | null>;
    /**
     * List user's skills
     */
    static listSkills(userId: string, includePublic?: boolean): Promise<user_skills[]>;
    /**
     * Deploy a skill (mark as active and generate code)
     */
    static deploySkill(skillId: string, userId: string): Promise<user_skills>;
    /**
     * Create a new workflow
     */
    static createWorkflow(userId: string, data: WorkflowInput): Promise<user_workflows>;
    /**
     * Update an existing workflow
     */
    static updateWorkflow(workflowId: string, userId: string, data: Partial<WorkflowInput>): Promise<user_workflows>;
    /**
     * Delete a workflow
     */
    static deleteWorkflow(workflowId: string, userId: string): Promise<void>;
    /**
     * Get workflow by ID with nodes and edges
     */
    static getWorkflow(workflowId: string, userId: string): Promise<(user_workflows & {
        nodes: workflow_nodes[];
        edges: workflow_edges[];
    }) | null>;
    /**
     * List user's workflows
     */
    static listWorkflows(userId: string, includePublic?: boolean): Promise<user_workflows[]>;
    /**
     * Add node to workflow
     */
    static addNode(workflowId: string, userId: string, data: WorkflowNodeInput): Promise<workflow_nodes>;
    /**
     * Update workflow node
     */
    static updateNode(nodeId: string, userId: string, data: Partial<WorkflowNodeInput>): Promise<workflow_nodes>;
    /**
     * Delete workflow node
     */
    static deleteNode(nodeId: string, userId: string): Promise<void>;
    /**
     * Add edge to workflow
     */
    static addEdge(workflowId: string, userId: string, data: WorkflowEdgeInput): Promise<workflow_edges>;
    /**
     * Update workflow edge
     */
    static updateEdge(edgeId: string, userId: string, data: Partial<Omit<WorkflowEdgeInput, 'sourceId' | 'targetId'>>): Promise<workflow_edges>;
    /**
     * Delete workflow edge
     */
    static deleteEdge(edgeId: string, userId: string): Promise<void>;
    /**
     * Deploy a workflow (mark as active)
     */
    static deployWorkflow(workflowId: string, userId: string): Promise<user_workflows>;
}
//# sourceMappingURL=visual-builder.service.d.ts.map
import type { ProgressionParams } from './workout-progression.service';
export interface ProgressionTemplateData extends ProgressionParams {
    name: string;
    description?: string;
}
export declare class ProgressionTemplateService {
    /**
     * Create a new progression template
     */
    static create(userId: string, data: ProgressionTemplateData): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: import("@prisma/client").$Enums.WorkoutTemplateType;
        userId: string | null;
        category: string | null;
        tags: string[];
        lastUsedAt: Date | null;
        usageCount: number;
        isPublic: boolean;
    }>;
    /**
     * List progression templates for a user
     */
    static list(userId: string): Promise<{
        id: any;
        name: any;
        description: any;
        params: ProgressionParams;
    }[]>;
    /**
     * Delete a progression template
     */
    static delete(userId: string, templateId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        type: import("@prisma/client").$Enums.WorkoutTemplateType;
        userId: string | null;
        category: string | null;
        tags: string[];
        lastUsedAt: Date | null;
        usageCount: number;
        isPublic: boolean;
    }>;
    /**
     * Get a specific template
     */
    static get(userId: string, templateId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        params: ProgressionParams;
    } | null>;
}

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
        name: string;
        userId: string | null;
        id: string;
        description: string | null;
        type: import("@prisma/client").$Enums.WorkoutTemplateType;
        createdAt: Date;
        updatedAt: Date;
        category: string | null;
        data: import("@prisma/client/runtime/client").JsonValue;
        tags: string[];
        isPublic: boolean;
        usageCount: number;
        lastUsedAt: Date | null;
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
        name: string;
        userId: string | null;
        id: string;
        description: string | null;
        type: import("@prisma/client").$Enums.WorkoutTemplateType;
        createdAt: Date;
        updatedAt: Date;
        category: string | null;
        data: import("@prisma/client/runtime/client").JsonValue;
        tags: string[];
        isPublic: boolean;
        usageCount: number;
        lastUsedAt: Date | null;
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
//# sourceMappingURL=progression-template.service.d.ts.map
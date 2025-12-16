import { prisma } from './prisma';
import { Prisma, InvitationType, InvitationStatus } from '@prisma/client';
export interface CreateInvitationInput {
    type: InvitationType;
    maxUses?: number;
    expiresAt?: Date;
    createdById: string;
    metadata?: Record<string, unknown>;
    code?: string;
}
export interface InvitationValidationResult {
    isValid: boolean;
    invitation?: Awaited<ReturnType<typeof prisma.invitations.findUnique>>;
    error?: string;
}
export declare class InvitationService {
    /**
     * Generate a unique invitation code
     */
    private static generateUniqueCode;
    /**
     * Create a new invitation
     */
    static createInvitation(input: CreateInvitationInput): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        type: import("@prisma/client").$Enums.InvitationType;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        createdById: string | null;
        expiresAt: Date | null;
        maxUses: number;
        usedCount: number;
    }>;
    /**
     * Validate an invitation code
     */
    static validateInvitation(code: string): Promise<InvitationValidationResult>;
    /**
     * Use an invitation (to be called during registration)
     */
    static useInvitation(code: string, userId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        type: import("@prisma/client").$Enums.InvitationType;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        createdById: string | null;
        expiresAt: Date | null;
        maxUses: number;
        usedCount: number;
    }>;
    /**
     * Revoke an invitation
     */
    static revokeInvitation(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        type: import("@prisma/client").$Enums.InvitationType;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        createdById: string | null;
        expiresAt: Date | null;
        maxUses: number;
        usedCount: number;
    }>;
    /**
     * Get invitations with filtering
     */
    static getInvitations(params: {
        page?: number;
        limit?: number;
        status?: InvitationStatus;
        type?: InvitationType;
        search?: string;
    }): Promise<{
        items: ({
            _count: {
                uses: number;
            };
            createdBy: {
                name: string | null;
                email: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InvitationStatus;
            type: import("@prisma/client").$Enums.InvitationType;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: Prisma.JsonValue | null;
            createdById: string | null;
            expiresAt: Date | null;
            maxUses: number;
            usedCount: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Expire invitations that have passed their expiration date
     */
    static expireInvitations(): Promise<number>;
}
//# sourceMappingURL=invitation.service.d.ts.map
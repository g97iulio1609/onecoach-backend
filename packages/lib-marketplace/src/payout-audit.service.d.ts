/**
 * Payout Audit Service
 *
 * Servizio per gestire audit log dei payout
 */
import { Prisma } from '@prisma/client';
export type PayoutAuditAction = 'CREATED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
interface CreateAuditLogParams {
    userId?: string;
    rewardIds: string[];
    action: PayoutAuditAction;
    amount?: number;
    currencyCode?: string;
    performedBy: string;
    notes?: string;
    metadata?: Prisma.JsonValue;
}
export declare class PayoutAuditService {
    /**
     * Crea un audit log entry
     */
    static createAuditLog(params: CreateAuditLogParams): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        notes: string | null;
        metadata: Prisma.JsonValue | null;
        amount: Prisma.Decimal | null;
        currencyCode: string | null;
        rewardIds: Prisma.JsonValue;
        action: string;
        performedBy: string;
    }>;
    /**
     * Recupera audit logs per utente
     */
    static getAuditLogsByUser(userId: string, limit?: number): Promise<({
        users: {
            id: string;
            email: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        notes: string | null;
        metadata: Prisma.JsonValue | null;
        amount: Prisma.Decimal | null;
        currencyCode: string | null;
        rewardIds: Prisma.JsonValue;
        action: string;
        performedBy: string;
    })[]>;
    /**
     * Recupera audit logs per admin che ha eseguito azioni
     */
    static getAuditLogsByPerformer(performedBy: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        notes: string | null;
        metadata: Prisma.JsonValue | null;
        amount: Prisma.Decimal | null;
        currencyCode: string | null;
        rewardIds: Prisma.JsonValue;
        action: string;
        performedBy: string;
    }[]>;
    /**
     * Recupera tutti gli audit logs (con filtri opzionali)
     */
    static getAllAuditLogs(params?: {
        userId?: string;
        action?: PayoutAuditAction;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<({
        users: {
            id: string;
            email: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        notes: string | null;
        metadata: Prisma.JsonValue | null;
        amount: Prisma.Decimal | null;
        currencyCode: string | null;
        rewardIds: Prisma.JsonValue;
        action: string;
        performedBy: string;
    })[]>;
}
export {};

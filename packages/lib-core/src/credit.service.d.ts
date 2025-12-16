/**
 * Credit Service
 *
 * Gestione crediti utente e transazioni
 * Implementa ICreditService contract
 */
import { Prisma } from '@prisma/client';
import type { TransactionType } from '@prisma/client';
import type { ICreditService } from '@onecoach/contracts';
/**
 * Implementazione Credit Service
 */
export declare class CreditService implements ICreditService {
    getCreditBalance(userId: string): Promise<number>;
    checkCredits(userId: string, amount: number): Promise<boolean>;
    consumeCredits(params: {
        userId: string;
        amount: number;
        type: TransactionType;
        description: string;
        metadata?: Record<string, unknown>;
    }): Promise<boolean>;
    addCredits(params: {
        userId: string;
        amount: number;
        type: TransactionType;
        description: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    getTransactionHistory(userId: string, limit?: number): Promise<Array<{
        id: string;
        userId: string;
        amount: number;
        type: TransactionType;
        description: string;
        createdAt: Date;
    }>>;
    getCreditStats(userId: string): Promise<{
        balance: number;
        hasUnlimitedCredits: boolean;
        totalConsumed: number;
        totalAdded: number;
        lastTransaction?: {
            id: string;
            type: 'ADDED' | 'CONSUMED';
            amount: number;
            createdAt: Date;
        } | null;
    }>;
    /**
     * Metodo statico per compatibilità con codice esistente
     */
    static getCreditStats(userId: string): Promise<{
        balance: number;
        hasUnlimitedCredits: boolean;
        totalConsumed: number;
        totalAdded: number;
        lastTransaction?: {
            id: string;
            type: 'ADDED' | 'CONSUMED';
            amount: number;
            createdAt: Date;
        } | null;
    }>;
    private hasUnlimitedCredits;
    getCreditHistory(userId: string, limit?: number): Promise<{
        userId: string | null;
        id: string;
        description: string;
        type: import("@prisma/client").$Enums.TransactionType;
        createdAt: Date;
        metadata: Prisma.JsonValue | null;
        amount: number;
        balanceAfter: number;
    }[]>;
}
export declare const creditService: CreditService;
//# sourceMappingURL=credit.service.d.ts.map
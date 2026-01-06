/**
 * User Memory Service
 *
 * Gestione memoria dinamica utente per personalizzazione AI.
 * La memoria è strutturata per dominio (workout, nutrition, oneagenda, etc.)
 * e si aggiorna automaticamente dalle interazioni utente.
 */
import type { user_memories } from '@prisma/client';
import type { UserMemory, MemoryDomain, MemoryUpdate, GetMemoryOptions, MemoryContext, DomainMemory, MemoryPattern, MemoryInsight, MemoryHistoryItem } from './user-memory/types';
/**
 * User Memory Service
 */
export declare class UserMemoryService {
    /**
     * Get or create user memory
     */
    getOrCreate(userId: string): Promise<user_memories>;
    /**
     * Get user memory with optional filtering
     */
    getMemory(userId: string, options?: GetMemoryOptions): Promise<UserMemory>;
    /**
     * Update memory for a specific domain
     */
    updateMemory(userId: string, update: MemoryUpdate): Promise<UserMemory>;
    /**
     * Save memory version snapshot
     */
    saveVersion(userId: string, changeType: 'manual' | 'auto' | 'enhanced', changeNote?: string): Promise<void>;
    /**
     * Get version history
     */
    getVersionHistory(userId: string, limit?: number): Promise<Array<{
        id: string;
        versionNumber: number;
        memory: UserMemory;
        changeType: string;
        changeNote: string | null;
        changedBy: string | null;
        createdAt: Date;
    }>>;
    /**
     * Get specific version
     */
    getVersion(userId: string, versionNumber: number): Promise<UserMemory | null>;
    /**
     * Restore memory to specific version
     */
    restoreVersion(userId: string, versionNumber: number): Promise<UserMemory>;
    /**
     * Add history item to memory
     */
    addHistoryItem(userId: string, domain: MemoryDomain, item: Omit<MemoryHistoryItem, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Add pattern to memory
     */
    addPattern(userId: string, domain: MemoryDomain, pattern: Omit<MemoryPattern, 'firstObserved' | 'lastObserved'>): Promise<void>;
    /**
     * Add insight to memory
     */
    addInsight(userId: string, domain: MemoryDomain, insight: Omit<MemoryInsight, 'id' | 'generatedAt'>): Promise<void>;
    /**
     * Update preferences for a domain
     */
    updatePreferences(userId: string, domain: MemoryDomain, preferences: Partial<DomainMemory['preferences']>): Promise<void>;
    /**
     * Get memory context for AI agents
     */
    getMemoryContext(userId: string, domain?: MemoryDomain): Promise<MemoryContext>;
    /**
     * Merge memory context into base context
     */
    mergeContext(userId: string, baseContext: Record<string, unknown>, domain?: MemoryDomain): Promise<Record<string, unknown>>;
    /**
     * Filter memory based on options
     */
    private filterMemory;
    /**
     * Filter domain memory based on options
     */
    private filterDomainMemory;
    /**
     * Clean up old history items (keep only recent N items per domain)
     */
    cleanupHistory(userId: string, keepItems?: number): Promise<void>;
    /**
     * Get last analyzed timestamp
     */
    getLastAnalyzedAt(userId: string): Promise<Date | null>;
    /**
     * Update last analyzed timestamp
     */
    updateLastAnalyzedAt(userId: string): Promise<void>;
}
export declare const userMemoryService: UserMemoryService;
//# sourceMappingURL=user-memory.service.d.ts.map
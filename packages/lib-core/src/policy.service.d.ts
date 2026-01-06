/**
 * Policy Service
 *
 * Gestione delle policy pages (Privacy, Terms, GDPR, Content Policy)
 */
import { PolicyStatus, PolicyType } from '@prisma/client';
import type { policies, policy_history } from '@prisma/client';
export interface CreatePolicyParams {
    slug: string;
    type: PolicyType;
    title: string;
    content: string;
    metaDescription?: string;
    status?: PolicyStatus;
    createdById: string;
}
export interface UpdatePolicyParams {
    id: string;
    slug?: string;
    title?: string;
    content?: string;
    metaDescription?: string;
    status?: PolicyStatus;
    updatedById: string;
    changeReason?: string;
}
export interface PolicyWithCreator extends policies {
    createdBy: {
        id: string;
        name: string | null;
        email: string;
    };
    updatedBy?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
}
/**
 * Policy Service
 */
export declare class PolicyService {
    /**
     * Ottiene tutte le policy
     */
    static getAllPolicies(includeCreator?: boolean): Promise<PolicyWithCreator[]>;
    /**
     * Ottiene le policy pubblicate
     */
    static getPublishedPolicies(): Promise<policies[]>;
    /**
     * Ottiene una policy per ID
     */
    static getPolicyById(id: string, includeCreator?: boolean): Promise<PolicyWithCreator | null>;
    /**
     * Ottiene una policy per slug
     */
    static getPolicyBySlug(slug: string): Promise<policies | null>;
    /**
     * Ottiene una policy per tipo
     */
    static getPolicyByType(type: PolicyType): Promise<policies | null>;
    /**
     * Crea una nuova policy
     */
    static createPolicy(params: CreatePolicyParams): Promise<policies>;
    /**
     * Aggiorna una policy esistente
     */
    static updatePolicy(params: UpdatePolicyParams): Promise<policies>;
    /**
     * Elimina una policy
     */
    static deletePolicy(id: string): Promise<void>;
    /**
     * Crea un record nello storico
     */
    private static createHistoryRecord;
    /**
     * Ottiene lo storico di una policy
     */
    static getPolicyHistory(policyId: string, limit?: number): Promise<policy_history[]>;
    /**
     * Ottiene tutto lo storico
     */
    static getAllHistory(limit?: number): Promise<policy_history[]>;
    /**
     * Verifica se uno slug è disponibile
     */
    static isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
    /**
     * Genera uno slug da un titolo
     */
    static generateSlug(title: string): string;
    /**
     * Pubblica una policy
     */
    static publishPolicy(id: string, userId: string): Promise<policies>;
    /**
     * Archivia una policy
     */
    static archivePolicy(id: string, userId: string): Promise<policies>;
    /**
     * Ottiene le statistiche delle policy
     */
    static getPolicyStats(): Promise<{
        total: number;
        published: number;
        draft: number;
        archived: number;
    }>;
}
//# sourceMappingURL=policy.service.d.ts.map
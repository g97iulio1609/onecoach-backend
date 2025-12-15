/**
 * Consent Service
 *
 * Gestione dei consensi utente per le policy (Privacy, Terms, GDPR, Content)
 */
import type { PolicyType } from '@prisma/client';
export interface CreateConsentParams {
    userId: string;
    policyType: PolicyType;
    ipAddress?: string;
    userAgent?: string;
}
export interface UserConsentStatus {
    policyId: string;
    policyType: PolicyType;
    policyVersion: number;
    consented: boolean;
    consentedAt: Date;
    withdrawnAt: Date | null;
}
/**
 * Consent Service
 */
export declare class ConsentService {
    /**
     * Crea o aggiorna il consenso di un utente per una policy
     */
    static giveConsent(params: CreateConsentParams): Promise<void>;
    /**
     * Ritira il consenso di un utente per una policy
     */
    static withdrawConsent(userId: string, policyType: PolicyType): Promise<void>;
    /**
     * Verifica se un utente ha dato il consenso a una policy
     */
    static hasConsent(userId: string, policyType: PolicyType): Promise<boolean>;
    /**
     * Ottiene tutti i consensi di un utente
     */
    static getUserConsents(userId: string): Promise<UserConsentStatus[]>;
    /**
     * Verifica se l'utente ha dato consenso a tutte le policy obbligatorie
     * Policy obbligatorie: PRIVACY e TERMS
     */
    static hasRequiredConsents(userId: string): Promise<boolean>;
    /**
     * Verifica se esistono policy obbligatorie pubblicate
     */
    static areRequiredPoliciesPublished(): Promise<boolean>;
}
//# sourceMappingURL=consent.service.d.ts.map
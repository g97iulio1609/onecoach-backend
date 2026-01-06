/**
 * Consent Service
 *
 * Gestione dei consensi utente per le policy (Privacy, Terms, GDPR, Content)
 */
import { prisma } from './prisma';
import { PolicyService } from './policy.service';
/**
 * Consent Service
 */
export class ConsentService {
    /**
     * Crea o aggiorna il consenso di un utente per una policy
     */
    static async giveConsent(params) {
        const { userId, policyType, ipAddress, userAgent } = params;
        // Ottieni la policy pubblicata del tipo richiesto
        const policy = await PolicyService.getPolicyByType(policyType);
        if (!policy || policy.status !== 'PUBLISHED') {
            throw new Error(`Policy di tipo ${policyType} non trovata o non pubblicata`);
        }
        // Verifica se esiste già un consenso
        const existingConsent = await prisma.user_consents.findFirst({
            where: {
                userId,
                policyId: policy.id,
            },
        });
        if (existingConsent) {
            // Se esiste e è già stato ritirato, aggiorna per riattivare
            if (!existingConsent.consented) {
                await prisma.user_consents.updateMany({
                    where: {
                        userId,
                        policyId: policy.id,
                    },
                    data: {
                        consented: true,
                        consentedAt: new Date(),
                        withdrawnAt: null,
                        policyVersion: policy.version,
                        ipAddress,
                        userAgent,
                        updatedAt: new Date(),
                    },
                });
            }
            // Se già consenziente, aggiorna solo la versione se è cambiata
            else if (existingConsent.policyVersion !== policy.version) {
                await prisma.user_consents.updateMany({
                    where: {
                        userId,
                        policyId: policy.id,
                    },
                    data: {
                        policyVersion: policy.version,
                        consentedAt: new Date(),
                        ipAddress,
                        userAgent,
                        updatedAt: new Date(),
                    },
                });
            }
        }
        else {
            // Crea nuovo consenso
            await prisma.user_consents.create({
                data: {
                    userId,
                    policyId: policy.id,
                    policyType,
                    policyVersion: policy.version,
                    consented: true,
                    consentedAt: new Date(),
                    ipAddress,
                    userAgent,
                },
            });
        }
    }
    /**
     * Ritira il consenso di un utente per una policy
     */
    static async withdrawConsent(userId, policyType) {
        const policy = await PolicyService.getPolicyByType(policyType);
        if (!policy) {
            throw new Error(`Policy di tipo ${policyType} non trovata`);
        }
        await prisma.user_consents.updateMany({
            where: {
                userId,
                policyId: policy.id,
            },
            data: {
                consented: false,
                withdrawnAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Verifica se un utente ha dato il consenso a una policy
     */
    static async hasConsent(userId, policyType) {
        const policy = await PolicyService.getPolicyByType(policyType);
        if (!policy) {
            return false;
        }
        const consent = await prisma.user_consents.findFirst({
            where: {
                userId,
                policyId: policy.id,
            },
        });
        return consent?.consented === true && consent.policyVersion === policy.version;
    }
    /**
     * Ottiene tutti i consensi di un utente
     */
    static async getUserConsents(userId) {
        const consents = await prisma.user_consents.findMany({
            where: { userId },
            include: {
                policies: true,
            },
            orderBy: { consentedAt: 'desc' },
        });
        return consents.map((consent) => ({
            policyId: consent.policyId,
            policyType: consent.policyType,
            policyVersion: consent.policyVersion,
            consented: consent.consented,
            consentedAt: consent.consentedAt,
            withdrawnAt: consent.withdrawnAt,
        }));
    }
    /**
     * Verifica se l'utente ha dato consenso a tutte le policy obbligatorie
     * Policy obbligatorie: PRIVACY e TERMS
     */
    static async hasRequiredConsents(userId) {
        const privacyConsent = await this.hasConsent(userId, 'PRIVACY');
        const termsConsent = await this.hasConsent(userId, 'TERMS');
        return privacyConsent && termsConsent;
    }
    /**
     * Verifica se esistono policy obbligatorie pubblicate
     */
    static async areRequiredPoliciesPublished() {
        const privacyPolicy = await PolicyService.getPolicyByType('PRIVACY');
        const termsPolicy = await PolicyService.getPolicyByType('TERMS');
        return privacyPolicy?.status === 'PUBLISHED' && termsPolicy?.status === 'PUBLISHED';
    }
}

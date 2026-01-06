/**
 * Onboarding Service
 *
 * Gestisce lo stato e il progresso dell'onboarding wizard
 * Implementa IOnboardingService contract
 */
import type { IOnboardingService } from '@onecoach/contracts';
import type { OnboardingProgress, StepCompletionInput } from '@onecoach/types';
/**
 * Onboarding step configuration
 * Definisce i 15 step del wizard
 */
export declare const ONBOARDING_STEPS: {
    readonly PROFILE_SETUP: 1;
    readonly GOALS_SETUP: 2;
    readonly DASHBOARD_TOUR: 3;
    readonly LIVE_COACH_INTRO: 4;
    readonly ANALYTICS_INTRO: 5;
    readonly CHAT_INTRO: 6;
    readonly CALENDAR_INTRO: 7;
    readonly CREATION_INTRO: 8;
    readonly PROFILE_COMPLETE: 9;
    readonly CREDITS_INTRO: 10;
    readonly MARKETPLACE_INTRO: 11;
    readonly AFFILIATES_INTRO: 12;
    readonly COACH_OPTION: 13;
    readonly SUBSCRIPTION_OFFER: 14;
    readonly COMPLETION: 15;
};
export declare const TOTAL_STEPS = 15;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS];
/**
 * Onboarding Service
 */
export declare class OnboardingService implements IOnboardingService {
    /**
     * Ottiene o crea il progresso onboarding per un utente
     */
    getOrCreate(userId: string): Promise<OnboardingProgress>;
    /**
     * Ottiene il progresso corrente per un utente
     */
    getProgress(userId: string): Promise<OnboardingProgress | null>;
    /**
     * Completa uno step dell'onboarding
     */
    completeStep(userId: string, input: StepCompletionInput): Promise<OnboardingProgress>;
    /**
     * Vai a uno step specifico (utile per navigation tra step)
     */
    goToStep(userId: string, stepNumber: number): Promise<OnboardingProgress>;
    /**
     * Resetta l'onboarding (utile per testing o re-onboarding)
     */
    reset(userId: string): Promise<OnboardingProgress>;
    /**
     * Completa immediatamente l'onboarding (skip all)
     */
    completeAll(userId: string): Promise<OnboardingProgress>;
    /**
     * Controlla se un utente ha completato l'onboarding
     */
    isCompleted(userId: string): Promise<boolean>;
    /**
     * Helper per deserializzare il progresso dal database
     * Converte i JSON fields in oggetti TypeScript tipizzati
     */
    private deserializeProgress;
}
export declare const onboardingService: OnboardingService;
//# sourceMappingURL=onboarding.service.d.ts.map
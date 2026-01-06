/**
 * @onecoach/lib-registry
 *
 * Service registry per dependency injection
 * Permette swap di implementazioni (test, mock, alternative)
 */
import type { INutritionService, IWorkoutService, IExerciseService, IFoodService, IAnalyticsService, ICreditService, ISubscriptionService, IUserProfileService, IPaymentService, IOnboardingService, IChatService, IMarketplaceService, ICoachService } from '@onecoach/contracts';
/**
 * Service registry type
 */
type ServiceKey = 'nutrition' | 'workout' | 'exercise' | 'food' | 'analytics' | 'credit' | 'subscription' | 'userProfile' | 'payment' | 'onboarding' | 'chat' | 'marketplace' | 'coach';
type ServiceMap = {
    nutrition: INutritionService;
    workout: IWorkoutService;
    exercise: IExerciseService;
    food: IFoodService;
    analytics: IAnalyticsService;
    credit: ICreditService;
    subscription: ISubscriptionService;
    userProfile: IUserProfileService;
    payment: IPaymentService;
    onboarding: IOnboardingService;
    chat: IChatService;
    marketplace: IMarketplaceService;
    coach: ICoachService;
};
/**
 * Service Registry
 *
 * Central registry per iniettare servizi
 * Pattern: getService<INutritionService>('nutrition')
 */
declare class ServiceRegistry {
    private services;
    /**
     * Registra un servizio
     */
    register<K extends ServiceKey>(key: K, service: ServiceMap[K]): void;
    /**
     * Ottiene un servizio
     */
    get<K extends ServiceKey>(key: K): ServiceMap[K];
    /**
     * Verifica se un servizio è registrato
     */
    has(key: ServiceKey): boolean;
    /**
     * Rimuove un servizio
     */
    unregister(key: ServiceKey): void;
    /**
     * Resetta il registry (utile per test)
     */
    reset(): void;
}
/**
 * Singleton instance
 */
export declare const serviceRegistry: ServiceRegistry;
/**
 * Helper function per ottenere un servizio
 */
export declare function getService<K extends ServiceKey>(key: K): ServiceMap[K];
/**
 * Helper function per registrare un servizio
 */
export declare function registerService<K extends ServiceKey>(key: K, service: ServiceMap[K]): void;
export {};
/**
 * Re-export registration function
 */
//# sourceMappingURL=index.d.ts.map
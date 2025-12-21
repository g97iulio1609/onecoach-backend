/**
 * @onecoach/lib-registry
 *
 * Service registry per dependency injection
 * Permette swap di implementazioni (test, mock, alternative)
 */
/**
 * Service Registry
 *
 * Central registry per iniettare servizi
 * Pattern: getService<INutritionService>('nutrition')
 */
class ServiceRegistry {
    services = new Map();
    /**
     * Registra un servizio
     */
    register(key, service) {
        this.services.set(key, service);
    }
    /**
     * Ottiene un servizio
     */
    get(key) {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service '${key}' not registered`);
        }
        return service;
    }
    /**
     * Verifica se un servizio è registrato
     */
    has(key) {
        return this.services.has(key);
    }
    /**
     * Rimuove un servizio
     */
    unregister(key) {
        this.services.delete(key);
    }
    /**
     * Resetta il registry (utile per test)
     */
    reset() {
        this.services.clear();
    }
}
/**
 * Singleton instance
 */
export const serviceRegistry = new ServiceRegistry();
/**
 * Helper function per ottenere un servizio
 */
export function getService(key) {
    return serviceRegistry.get(key);
}
/**
 * Helper function per registrare un servizio
 */
export function registerService(key, service) {
    serviceRegistry.register(key, service);
}
/**
 * Re-export registration function
 */
// export { registerAllServices } from './register-services';

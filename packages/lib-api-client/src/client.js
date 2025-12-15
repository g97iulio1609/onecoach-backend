/**
 * API Client Factory
 *
 * Crea l'istanza corretta di API client basata sulla piattaforma
 */
import { WebApiClient } from './core/web-client';
import { NativeApiClient } from './core/native-client';
import { LoggingInterceptor } from './interceptors';
// Platform detection
const isNative = typeof window === 'undefined' &&
    typeof process !== 'undefined' &&
    process.env.EXPO_PUBLIC_API_URL;
// Create platform-specific client
const apiClient = isNative ? new NativeApiClient() : new WebApiClient();
// Add logging interceptor in development
if (process.env.NODE_ENV === 'development') {
    apiClient.use(new LoggingInterceptor());
}
export { apiClient };
export { WebApiClient, NativeApiClient } from './core';
export * from './core/types';
export * from './interceptors';

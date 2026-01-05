/**
 * Logging Interceptor
 *
 * Interceptor per logging di richieste e risposte (solo in development)
 */
export class LoggingInterceptor {
    async onRequest(config) {
        return config;
    }
    async onResponse(response) {
        return response;
    }
}

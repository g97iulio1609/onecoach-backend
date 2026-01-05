/**
 * Auth Interceptor
 *
 * Interceptor per aggiungere automaticamente il token di autenticazione
 */
export class AuthInterceptor {
    getToken;
    constructor(getToken) {
        this.getToken = getToken;
    }
    async onRequest(config) {
        if (!config.skipAuth) {
            const token = await this.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    }
}

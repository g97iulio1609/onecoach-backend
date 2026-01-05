/**
 * Retry Interceptor
 *
 * Interceptor per gestire retry automatico su errori 401 con refresh token
 */
export class RetryInterceptor {
    refreshToken;
    retryRequest;
    constructor(refreshToken, retryRequest) {
        this.refreshToken = refreshToken;
        this.retryRequest = retryRequest;
    }
    async onResponse(response) {
        return response;
    }
    async onError(error) {
        if (error.status === 401 && error.config && !error.config.skipAuth) {
            try {
                await this.refreshToken();
                return await this.retryRequest(error.config);
            }
            catch (refreshError) {
                throw error;
            }
        }
        throw error;
    }
}

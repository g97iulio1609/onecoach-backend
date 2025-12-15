/**
 * Native API Client
 *
 * Implementazione native di BaseApiClient per React Native con refresh token
 */
import { BaseApiClient } from './base-client';
import { getAccessToken, getRefreshToken, updateAccessToken, clearSession, } from '@onecoach/lib-core/auth/session.native';
export class NativeApiClient extends BaseApiClient {
    refreshPromise = null;
    getDefaultBaseUrl() {
        return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    }
    async getAuthToken() {
        return await getAccessToken();
    }
    async saveAuthToken(_token) {
        // Token is saved via updateAccessToken in refresh flow
        // This method is kept for interface compliance
    }
    /**
     * Refresh access token using refresh token
     * Prevents multiple simultaneous refresh requests
     */
    async refreshAccessToken() {
        // If refresh is already in progress, wait for it
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        this.refreshPromise = (async () => {
            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });
                if (!response.ok) {
                    throw new Error('Refresh token invalid');
                }
                const data = await response.json();
                const expiresAt = Date.now() + data.expiresIn * 1000;
                await updateAccessToken(data.accessToken, expiresAt);
            }
            finally {
                this.refreshPromise = null;
            }
        })();
        return this.refreshPromise;
    }
    async request(endpoint, options = {}) {
        try {
            return await super.request(endpoint, options);
        }
        catch (error) {
            // Handle 401 Unauthorized - token expired
            const { ApiError } = await import('./types');
            if (error instanceof ApiError && error.status === 401 && !options.skipAuth) {
                // Try to refresh token
                try {
                    await this.refreshAccessToken();
                    // Retry original request with new token
                    return this.request(endpoint, options);
                }
                catch (refreshError) {
                    // Refresh failed, clear session and throw
                    await clearSession();
                    throw new ApiError('Session expired', 401);
                }
            }
            throw error;
        }
    }
}

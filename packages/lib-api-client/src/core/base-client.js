/**
 * Base API Client
 *
 * Classe base astratta per API client cross-platform con supporto interceptors
 */
import { ApiError } from './types';
export class BaseApiClient {
    baseUrl;
    requestInterceptors = [];
    responseInterceptors = [];
    constructor(baseUrl) {
        this.baseUrl = baseUrl || this.getDefaultBaseUrl();
    }
    use(interceptor) {
        if ('onRequest' in interceptor) {
            this.requestInterceptors.push(interceptor);
        }
        else {
            this.responseInterceptors.push(interceptor);
        }
        return this;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    buildConfig(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        return {
            url,
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            skipAuth: options.skipAuth,
        };
    }
    async request(endpoint, options = {}) {
        let config = this.buildConfig(endpoint, options);
        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor.onRequest(config);
        }
        // Add auth token if not skipped
        if (!config.skipAuth) {
            const token = await this.getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        try {
            const response = await fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: config.body,
            });
            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return {};
            }
            // Check Content-Type to determine how to parse response
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');
            let responseData;
            if (isJson) {
                try {
                    responseData = (await response.json());
                }
                catch (jsonError) {
                    // If JSON parsing fails, try to read as text for better error message
                    const text = await response.text();
                    throw new ApiError(`Invalid JSON response: ${text.substring(0, 100)}`, response.status, { raw: text }, config);
                }
            }
            else {
                // For non-JSON responses, read as text
                const text = await response.text();
                // If response is not ok, throw error with text content
                if (!response.ok) {
                    throw new ApiError(`API Error: ${response.statusText}. Response: ${text.substring(0, 200)}`, response.status, { raw: text }, config);
                }
                // If response is ok but not JSON, try to parse as JSON anyway
                // (some APIs return JSON without proper Content-Type)
                try {
                    responseData = JSON.parse(text);
                }
                catch (_error) {
                    // If parsing fails, return text as data
                    responseData = text;
                }
            }
            const responseConfig = {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
            // Apply response interceptors
            let finalResponse = responseConfig;
            for (const interceptor of this.responseInterceptors) {
                finalResponse = await interceptor.onResponse(finalResponse);
            }
            if (!response.ok) {
                throw new ApiError(finalResponse.data?.error ||
                    finalResponse.data?.message ||
                    `API Error: ${response.statusText}`, response.status, finalResponse.data, config);
            }
            return finalResponse.data;
        }
        catch (error) {
            // Apply error interceptors
            for (const interceptor of this.responseInterceptors) {
                if (interceptor.onError) {
                    try {
                        return await interceptor.onError(error);
                    }
                    catch (e) {
                        // If interceptor doesn't handle it, continue to next
                    }
                }
            }
            // Re-throw if not handled
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(error instanceof Error ? error.message : 'Network error', 0, undefined, config);
        }
    }
    get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    post(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }
    put(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }
    patch(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }
    delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

/**
 * API Client Types
 */
export class ApiError extends Error {
    status;
    data;
    config;
    constructor(message, status, data, config) {
        super(message);
        this.status = status;
        this.data = data;
        this.config = config;
        this.name = 'ApiError';
    }
}

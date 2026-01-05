import { Logger as SharedLogger } from '@onecoach/lib-shared/utils/logger';
/**
 * Wrapper class that adapts lib-shared Logger to ILogger interface if needed,
 * though they are mostly compatible.
 */
class LoggerService {
    inner;
    constructor(context = 'App') {
        this.inner = new SharedLogger({ prefix: context });
    }
    debug(message, metadata) {
        this.inner.debug(message, metadata);
    }
    info(message, metadata) {
        this.inner.info(message, metadata);
    }
    warn(message, metadata) {
        this.inner.warn(message, metadata);
    }
    error(message, error, metadata) {
        this.inner.error(message, error, metadata);
    }
    child(context) {
        // SharedLogger.child already handles prefix concatenation
        const childShared = this.inner.child(context);
        const wrapper = new LoggerService();
        wrapper.inner = childShared;
        return wrapper;
    }
}
// Export default instance
export const logger = new LoggerService();
// Export class for custom instances
export { LoggerService as Logger };

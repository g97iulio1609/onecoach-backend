import { type LogLevel as SharedLogLevel } from '@onecoach/lib-shared/utils/logger';
/**
 * @onecoach/lib-core
 * Standardized Logger Service
 *
 * Re-exports and wraps the high-quality logger from lib-shared
 * to provide a stable API for core services.
 */
export type LogLevel = SharedLogLevel;
export interface LogMetadata {
    [key: string]: any;
}
export interface ILogger {
    debug(message: string, metadata?: LogMetadata): void;
    info(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    error(message: string, error?: Error | string | unknown, metadata?: LogMetadata): void;
    child(context: string): ILogger;
}
/**
 * Wrapper class that adapts lib-shared Logger to ILogger interface if needed,
 * though they are mostly compatible.
 */
declare class LoggerService implements ILogger {
    private inner;
    constructor(context?: string);
    debug(message: string, metadata?: LogMetadata): void;
    info(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    error(message: string, error?: Error | string | unknown, metadata?: LogMetadata): void;
    child(context: string): ILogger;
}
export declare const logger: LoggerService;
export { LoggerService as Logger };

/**
 * Environment Variables Helper - Server Only
 *
 * Server-side functions that may use Edge Config or other server-only features.
 * This file should only be imported in server components or API routes.
 */
import 'server-only';
/**
 * Get AI Provider API Key (Async, checks Edge Config first)
 * Server-only function that can access Edge Config
 *
 * Note: Edge Config access is handled by lib-core, this function
 * provides a simple fallback to static env vars for lib-config usage
 */
export declare function getDynamicAIProviderKey(provider: string): Promise<string | undefined>;
//# sourceMappingURL=env.server.d.ts.map
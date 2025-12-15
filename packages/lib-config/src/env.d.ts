/**
 * Environment Variables Helper
 *
 * Provides static access to environment variables for Vercel compatibility.
 * Dynamic access like process.env[key] doesn't work on Vercel because
 * Next.js inlines env vars at build time only for static property access.
 */
/**
 * Get AI Provider API Key
 * Uses static property access for Vercel compatibility
 */
export declare function getAIProviderKey(provider: string): string | undefined;
/**
 * Get OpenRouter configuration
 */
export declare function getOpenRouterConfig(): {
    apiKey: string;
    baseUrl: string;
    siteUrl: string;
    appName: string;
};
/**
 * Get all configured AI provider keys
 */
export declare function getAllAIProviderKeys(): {
    anthropic: string;
    openai: string;
    google: string;
    xai: string;
    openrouter: string;
};
/**
 * Check if any AI provider key is configured
 */
export declare function hasAnyAIProviderKey(): boolean;
//# sourceMappingURL=env.d.ts.map
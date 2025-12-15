/**
 * Admin Utilities
 *
 * Funzioni helper per gestione admin/super admin
 * Segue principi KISS, SOLID, DRY, YAGNI
 */
/**
 * Verifica se le credenziali admin sono configurate in env vars
 */
export declare function hasAdminCredentials(): boolean;
/**
 * Verifica se le credenziali super admin sono configurate in env vars
 */
export declare function hasSuperAdminCredentials(): boolean;
/**
 * Verifica se almeno una coppia di credenziali admin è configurata
 */
export declare function hasAnyAdminCredentials(): boolean;
/**
 * Ottiene email admin da env vars
 */
export declare function getAdminEmail(): string | null;
/**
 * Ottiene email super admin da env vars
 */
export declare function getSuperAdminEmail(): string | null;
//# sourceMappingURL=admin-utils.d.ts.map
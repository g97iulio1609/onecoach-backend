/**
 * Admin Utilities
 *
 * Funzioni helper per gestione admin/super admin
 * Segue principi KISS, SOLID, DRY, YAGNI
 */
/**
 * Verifica se le credenziali admin sono configurate in env vars
 */
export function hasAdminCredentials() {
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD?.trim();
    return !!(adminEmail && adminPassword);
}
/**
 * Verifica se le credenziali super admin sono configurate in env vars
 */
export function hasSuperAdminCredentials() {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim();
    const superAdminPassword = process.env.SUPER_ADMIN_DEFAULT_PASSWORD?.trim();
    return !!(superAdminEmail && superAdminPassword);
}
/**
 * Verifica se almeno una coppia di credenziali admin è configurata
 */
export function hasAnyAdminCredentials() {
    return hasAdminCredentials() || hasSuperAdminCredentials();
}
/**
 * Ottiene email admin da env vars
 */
export function getAdminEmail() {
    return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}
/**
 * Ottiene email super admin da env vars
 */
export function getSuperAdminEmail() {
    return process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || null;
}

/**
 * Role Utilities
 *
 * Normalizzazione e verifica ruoli centralizzata per evitare duplicazioni.
 * Segue KISS/DRY: espone helper riutilizzabili sia su client che server.
 */
const ROLE_ALIAS_MAP = {
    USER: 'USER',
    ATHLETE: 'USER', // alias legacy per utenti standard
    ADMIN: 'ADMIN',
    COACH: 'COACH',
    SUPERADMIN: 'SUPER_ADMIN',
};
const ROLE_INHERITANCE = {
    USER: ['USER'],
    COACH: ['COACH', 'USER'],
    // Admin e Super Admin possono accedere anche alle funzionalità coach
    ADMIN: ['ADMIN', 'COACH', 'USER'],
    SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'COACH', 'USER'],
};
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
/**
 * Normalizza qualsiasi input ruolo (enum, stringa, alias) in un valore canonico.
 */
export function normalizeRole(role) {
    if (!role)
        return null;
    const sanitized = role.toString().trim().toUpperCase();
    if (!sanitized)
        return null;
    const key = sanitized.replace(/[^A-Z]/g, '');
    return ROLE_ALIAS_MAP[key] ?? null;
}
/**
 * Verifica se il ruolo soddisfa quello richiesto, includendo ereditarietà (es. SUPER_ADMIN => ADMIN).
 */
export function roleSatisfies(requiredRole, role) {
    const normalized = normalizeRole(role);
    if (!normalized)
        return false;
    return ROLE_INHERITANCE[normalized].includes(requiredRole);
}
export function isAdminRole(role) {
    return roleSatisfies('ADMIN', role);
}
export function isSuperAdminRole(role) {
    return normalizeRole(role) === 'SUPER_ADMIN';
}
export function isCoachRole(role) {
    return roleSatisfies('COACH', role);
}
export function isUserRole(role) {
    return normalizeRole(role) === 'USER';
}

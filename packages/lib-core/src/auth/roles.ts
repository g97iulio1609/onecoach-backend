/**
 * Role Utilities
 *
 * Normalizzazione e verifica ruoli centralizzata per evitare duplicazioni.
 * Segue KISS/DRY: espone helper riutilizzabili sia su client che server.
 */

export type AppUserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'COACH';
export type UserRole = AppUserRole;

const ROLE_ALIAS_MAP: Record<string, AppUserRole> = {
  USER: 'USER',
  ATHLETE: 'USER', // alias legacy per utenti standard
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  SUPERADMIN: 'SUPER_ADMIN',
};

const ROLE_INHERITANCE: Record<AppUserRole, ReadonlyArray<AppUserRole>> = {
  USER: ['USER'],
  COACH: ['COACH', 'USER'],
  // Admin e Super Admin possono accedere anche alle funzionalità coach
  ADMIN: ['ADMIN', 'COACH', 'USER'],
  SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'COACH', 'USER'],
};

export const ADMIN_ROLES: ReadonlyArray<AppUserRole> = ['ADMIN', 'SUPER_ADMIN'];

/**
 * Normalizza qualsiasi input ruolo (enum, stringa, alias) in un valore canonico.
 */
export function normalizeRole(role?: string | null): AppUserRole | null {
  if (!role) return null;
  const sanitized = role.toString().trim().toUpperCase();
  if (!sanitized) return null;
  const key = sanitized.replace(/[^A-Z]/g, '');
  return ROLE_ALIAS_MAP[key] ?? null;
}

/**
 * Verifica se il ruolo soddisfa quello richiesto, includendo ereditarietà (es. SUPER_ADMIN => ADMIN).
 */
export function roleSatisfies(requiredRole: AppUserRole, role?: string | null): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return ROLE_INHERITANCE[normalized].includes(requiredRole);
}

export function isAdminRole(role?: string | null): boolean {
  return roleSatisfies('ADMIN', role);
}

export function isSuperAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === 'SUPER_ADMIN';
}

export function isCoachRole(role?: string | null): boolean {
  return roleSatisfies('COACH', role);
}

export function isUserRole(role?: string | null): boolean {
  return normalizeRole(role) === 'USER';
}

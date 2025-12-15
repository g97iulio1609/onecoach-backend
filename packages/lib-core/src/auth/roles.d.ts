/**
 * Role Utilities
 *
 * Normalizzazione e verifica ruoli centralizzata per evitare duplicazioni.
 * Segue KISS/DRY: espone helper riutilizzabili sia su client che server.
 */
export type AppUserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'COACH';
export type UserRole = AppUserRole;
export declare const ADMIN_ROLES: ReadonlyArray<AppUserRole>;
/**
 * Normalizza qualsiasi input ruolo (enum, stringa, alias) in un valore canonico.
 */
export declare function normalizeRole(role?: string | null): AppUserRole | null;
/**
 * Verifica se il ruolo soddisfa quello richiesto, includendo ereditarietà (es. SUPER_ADMIN => ADMIN).
 */
export declare function roleSatisfies(requiredRole: AppUserRole, role?: string | null): boolean;
export declare function isAdminRole(role?: string | null): boolean;
export declare function isSuperAdminRole(role?: string | null): boolean;
export declare function isCoachRole(role?: string | null): boolean;
export declare function isUserRole(role?: string | null): boolean;
//# sourceMappingURL=roles.d.ts.map
/**
 * Session Helpers
 *
 * Utility functions per gestire la sessione utente (NextAuth v5)
 */
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';
export type AuthenticatedUser = {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    credits: number;
    image?: string | null;
    copilotEnabled: boolean;
};
/**
 * Ottiene la sessione corrente (server-side)
 */
export declare function getCurrentSession(): Promise<Session | null>;
/**
 * Ottiene l'utente corrente dalla sessione
 */
export declare function getCurrentUser(): Promise<AuthenticatedUser | null>;
/**
 * Verifica se l'utente è autenticato
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Ottiene l'ID dell'utente corrente
 */
export declare function getCurrentUserId(): Promise<string | null>;
/**
 * Verifica se l'utente ha un ruolo specifico
 */
export declare function hasRole(role: string): Promise<boolean>;
/**
 * Verifica se l'utente è admin
 */
export declare function isAdmin(): Promise<boolean>;
/**
 * Ottiene i crediti dell'utente corrente
 */
export declare function getCurrentUserCredits(): Promise<number>;

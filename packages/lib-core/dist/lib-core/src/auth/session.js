/**
 * Session Helpers
 *
 * Utility functions per gestire la sessione utente (NextAuth v5)
 */
import { auth } from './config';
// TODO: Spostare logError in lib-shared o creare utility per errori
// Per ora manteniamo import da lib/utils/logger per evitare dipendenze extra
import { logError } from '@onecoach/lib-shared/utils/logger';
import { normalizeRole, roleSatisfies } from './roles';
/**
 * Verifica se un errore è un errore di decryption JWT
 */
function isJWTDecryptionError(error) {
    if (!error)
        return false;
    // Controlla se è un JWTSessionError
    if (error instanceof Error) {
        const errorName = error.constructor.name;
        const errorMessage = error.message.toLowerCase();
        // NextAuth v5 lancia JWTSessionError
        if (errorName === 'JWTSessionError') {
            return true;
        }
        // Controlla messaggi di errore comuni
        if (errorMessage.includes('no matching decryption secret') ||
            errorMessage.includes('jwt session error') ||
            errorMessage.includes('decryption failed')) {
            return true;
        }
        // Controlla anche la causa (cause) dell'errore
        const cause = error?.cause;
        if (cause instanceof Error) {
            const causeMessage = cause.message.toLowerCase();
            if (causeMessage.includes('no matching decryption secret') ||
                causeMessage.includes('decryption failed')) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Pulisce i cookie di sessione invalidi
 * Chiamata automaticamente quando viene rilevato un errore di decryption JWT
 * Nota: cookies() è disponibile solo in Server Components, non in API routes
 */
async function clearInvalidSessionCookies() {
    try {
        // Import dinamico per evitare errori in API routes
        // cookies() è disponibile solo in Server Components
        // Usiamo import() invece di require() per compatibilità con ESM
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        // NextAuth v5 usa questi nomi di cookie
        cookieStore.delete('authjs.session-token');
        cookieStore.delete('authjs.csrf-token');
        cookieStore.delete('authjs.callback-url');
    }
    catch (error) {
        // Ignora errori durante la pulizia dei cookie
        // Può fallire in API routes dove cookies() non è disponibile
        // I cookie invalidi verranno comunque ignorati da NextAuth
    }
}
async function getSafeSession() {
    try {
        return await auth();
    }
    catch (error) {
        // Se è un errore di decryption JWT, pulisci i cookie invalidi
        if (isJWTDecryptionError(error)) {
            // Questo è un caso normale quando il segreto cambia o i cookie sono vecchi
            // Pulisci i cookie e restituisci null senza loggare come errore critico
            // Non attendiamo il risultato per non bloccare la risposta
            void clearInvalidSessionCookies();
            return null;
        }
        // Per altri errori, logga normalmente
        logError('Failed to retrieve session', error);
        return null;
    }
}
/**
 * Ottiene la sessione corrente (server-side)
 */
export async function getCurrentSession() {
    return await getSafeSession();
}
/**
 * Ottiene l'utente corrente dalla sessione
 */
export async function getCurrentUser() {
    const session = await getSafeSession();
    if (!session?.user) {
        return null;
    }
    return session.user;
}
/**
 * Verifica se l'utente è autenticato
 */
export async function isAuthenticated() {
    const session = await getSafeSession();
    return !!session?.user;
}
/**
 * Ottiene l'ID dell'utente corrente
 */
export async function getCurrentUserId() {
    const user = await getCurrentUser();
    return user?.id ?? null;
}
/**
 * Verifica se l'utente ha un ruolo specifico
 */
export async function hasRole(role) {
    const user = await getCurrentUser();
    const normalizedRequired = normalizeRole(role);
    if (!normalizedRequired) {
        return false;
    }
    return roleSatisfies(normalizedRequired, user?.role);
}
/**
 * Verifica se l'utente è admin
 */
export async function isAdmin() {
    return await hasRole('ADMIN');
}
/**
 * Ottiene i crediti dell'utente corrente
 */
export async function getCurrentUserCredits() {
    const user = await getCurrentUser();
    return user?.credits ?? 0;
}

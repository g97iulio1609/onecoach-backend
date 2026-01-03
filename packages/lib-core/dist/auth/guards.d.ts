/**
 * Auth Guards
 *
 * Guards per proteggere API routes e verificare autorizzazioni
 */
import { NextResponse } from 'next/server';
/**
 * Guard per verificare autenticazione
 * Ritorna user se autenticato, altrimenti NextResponse con errore 401
 */
export declare function requireAuth(): Promise<import("@onecoach/lib-core").AuthenticatedUser | NextResponse<{
    error: string;
}>>;
/**
 * Guard per verificare che l'utente sia admin o super admin
 * Ritorna user se admin/super admin, altrimenti NextResponse con errore 403
 */
export declare function requireAdmin(): Promise<import("@onecoach/lib-core").AuthenticatedUser | NextResponse<{
    error: string;
}>>;
/**
 * Guard per verificare che l'utente sia super admin
 * Ritorna user se super admin, altrimenti NextResponse con errore 403
 */
export declare function requireSuperAdmin(): Promise<import("@onecoach/lib-core").AuthenticatedUser | NextResponse<{
    error: string;
}>>;
/**
 * Verifica se l'utente può accedere alla risorsa
 * (è il proprietario o è admin)
 */
export declare function canAccessResource(resourceUserId: string): Promise<boolean>;
/**
 * Guard che verifica se l'utente può accedere alla risorsa
 */
export declare function requireResourceAccess(resourceUserId: string): Promise<import("@onecoach/lib-core").AuthenticatedUser | NextResponse<{
    error: string;
}>>;
/**
 * Wrapper per API route con auth guard
 */
export declare function withAuth(handler: (req: Request, user: unknown) => Promise<Response>): (req: Request) => Promise<Response>;
/**
 * Wrapper per API route con admin guard
 */
export declare function withAdmin(handler: (req: Request, user: unknown) => Promise<Response>): (req: Request) => Promise<Response>;
/**
 * Wrapper per API route con super admin guard
 */
export declare function withSuperAdmin(handler: (req: Request, user: unknown) => Promise<Response>): (req: Request) => Promise<Response>;

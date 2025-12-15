/**
 * Client-side Auth Guards
 *
 * Utility functions for role-based access control
 * Follows DRY principle - no duplication of role checks
 */
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './use-auth-unified';
/**
 * Hook to guard routes requiring authentication
 * Redirects to login if not authenticated
 *
 * @param redirectTo - Where to redirect if not authenticated (default: '/login')
 */
export function useRequireAuth(redirectTo = '/login') {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);
    return { isAuthenticated, isLoading };
}
/**
 * Hook to guard routes requiring specific role
 * Redirects if user doesn't have required role
 *
 * @param requiredRole - Role required to access
 * @param redirectTo - Where to redirect if unauthorized (default: '/dashboard')
 */
export function useRequireRole(requiredRole, redirectTo = '/dashboard') {
    const { user, isLoading, hasRole } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && user && !hasRole(requiredRole)) {
            router.push(redirectTo);
        }
    }, [user, isLoading, hasRole, requiredRole, router, redirectTo]);
    return {
        hasAccess: hasRole(requiredRole),
        isLoading,
        user,
    };
}
/**
 * Hook to guard coach routes
 */
export function useRequireCoach(redirectTo = '/dashboard') {
    return useRequireRole('COACH', redirectTo);
}
/**
 * Hook to guard admin routes
 */
export function useRequireAdmin(redirectTo = '/dashboard') {
    return useRequireRole('ADMIN', redirectTo);
}

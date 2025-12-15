/**
 * Unified Auth Hook
 *
 * Single source of truth for authentication state
 * Follows KISS, SOLID, DRY, YAGNI principles
 *
 * This hook:
 * - Syncs NextAuth session with Zustand store
 * - Provides consistent API across the app
 * - Eliminates duplication
 * - Simplifies authentication checks
 */
'use client';
import { useSyncAuth } from './use-auth';
import { useAuthStore } from '@onecoach/lib-stores';
import { isAdminRole, isCoachRole, normalizeRole, roleSatisfies, } from '@onecoach/types';
/**
 * Main authentication hook
 *
 * Single hook to rule them all - replaces all useSession, useMe, useCurrentUser calls
 *
 * @example
 * ```tsx
 * const { user, userId, isLoading, isAdmin } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!user) return <LoginRequired />;
 * if (!isAdmin) return <AccessDenied />;
 * ```
 */
export function useAuth() {
    // Sync NextAuth with Zustand (automatic)
    useSyncAuth();
    // Get state from Zustand (single source of truth)
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // Computed values (DRY - no duplication)
    const userId = user?.id ?? null;
    const normalizedRole = normalizeRole(user?.role);
    const isAdmin = isAdminRole(user?.role);
    const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
    const isCoach = isCoachRole(user?.role);
    const isAthlete = normalizedRole === 'USER';
    const ROLE_REQUIREMENTS = {
        ATHLETE: 'USER',
        COACH: 'COACH',
        ADMIN: 'ADMIN',
        SUPER_ADMIN: 'SUPER_ADMIN',
    };
    // Role check utility (reusable)
    const hasRole = (role) => {
        return roleSatisfies(ROLE_REQUIREMENTS[role], user?.role);
    };
    return {
        user,
        userId,
        isLoading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        isCoach,
        isAthlete,
        hasRole,
    };
}

/**
 * Client-side Auth Guards
 *
 * Utility functions for role-based access control
 * Follows DRY principle - no duplication of role checks
 */
type Role = 'ATHLETE' | 'COACH' | 'ADMIN' | 'SUPER_ADMIN';
/**
 * Hook to guard routes requiring authentication
 * Redirects to login if not authenticated
 *
 * @param redirectTo - Where to redirect if not authenticated (default: '/login')
 */
export declare function useRequireAuth(redirectTo?: string): {
    isAuthenticated: boolean;
    isLoading: boolean;
};
/**
 * Hook to guard routes requiring specific role
 * Redirects if user doesn't have required role
 *
 * @param requiredRole - Role required to access
 * @param redirectTo - Where to redirect if unauthorized (default: '/dashboard')
 */
export declare function useRequireRole(requiredRole: Role, redirectTo?: string): {
    hasAccess: boolean;
    isLoading: boolean;
    user: import("@onecoach/lib-stores").User;
};
/**
 * Hook to guard coach routes
 */
export declare function useRequireCoach(redirectTo?: string): {
    hasAccess: boolean;
    isLoading: boolean;
    user: import("@onecoach/lib-stores").User;
};
/**
 * Hook to guard admin routes
 */
export declare function useRequireAdmin(redirectTo?: string): {
    hasAccess: boolean;
    isLoading: boolean;
    user: import("@onecoach/lib-stores").User;
};
export {};
//# sourceMappingURL=use-guards.d.ts.map
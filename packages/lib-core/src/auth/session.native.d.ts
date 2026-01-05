/**
 * Session data stored securely
 */
export interface SessionData {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    userId: string;
}
/**
 * Save session data securely
 */
export declare function saveSession(session: SessionData): Promise<void>;
/**
 * Get current session data
 * Returns null if no session exists
 */
export declare function getSession(): Promise<SessionData | null>;
/**
 * Clear session data (logout)
 */
export declare function clearSession(): Promise<void>;
/**
 * Check if current session is valid (not expired)
 * Returns true if valid, false if expired or no session
 */
export declare function isSessionValid(): Promise<boolean>;
/**
 * Get access token if session is valid
 * Returns null if session is expired or doesn't exist
 */
export declare function getAccessToken(): Promise<string | null>;
/**
 * Get refresh token
 */
export declare function getRefreshToken(): Promise<string | null>;
/**
 * Update access token (after refresh)
 */
export declare function updateAccessToken(accessToken: string, expiresAt: number): Promise<void>;
/**
 * Check if session will expire soon (within 5 minutes)
 * Used to proactively refresh token
 */
export declare function isSessionExpiringSoon(): Promise<boolean>;

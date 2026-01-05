/**
 * User Profile Service
 *
 * Gestione profilo utente
 * Implementa IUserProfileService contract
 */
import type { user_profiles } from '@prisma/client';
import type { IUserProfileService, UserProfileInput } from '@onecoach/contracts';
export declare class UserProfileService implements IUserProfileService {
    getOrCreate(userId: string): Promise<user_profiles>;
    getSerialized(userId: string): Promise<Omit<user_profiles, 'weightKg'> & {
        weightKg: number | null;
    }>;
    update(userId: string, input: UserProfileInput): Promise<user_profiles>;
}
export declare const userProfileService: UserProfileService;

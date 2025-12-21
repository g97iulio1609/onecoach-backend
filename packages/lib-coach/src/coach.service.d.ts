/**
 * Coach Service
 *
 * CRUD operations for coach profiles and vetting
 * Implements SOLID principles (SRP, DIP)
 */
import type { CoachVerificationStatus, VettingStatus, coach_profiles, coach_vetting_requests } from '@prisma/client';
/**
 * Interface for Coach Service
 */
export interface ICoachService {
    getProfile(userId: string): Promise<coach_profiles | null>;
    createProfile(data: CreateCoachProfileInput): Promise<coach_profiles>;
    updateProfile(userId: string, data: UpdateCoachProfileInput): Promise<coach_profiles>;
    getPublicProfile(userId: string): Promise<PublicCoachProfile | null>;
    submitVettingRequest(data: SubmitVettingInput): Promise<coach_vetting_requests>;
    getVettingRequest(userId: string): Promise<coach_vetting_requests | null>;
    updateVettingStatus(requestId: string, status: VettingStatus, reviewNotes?: string, reviewedBy?: string): Promise<coach_vetting_requests>;
    updateCoachStats(userId: string): Promise<coach_profiles>;
}
/**
 * Input types
 */
export interface CreateCoachProfileInput {
    userId: string;
    bio?: string;
    credentials?: string;
    coachingStyle?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
}
export interface UpdateCoachProfileInput {
    bio?: string;
    credentials?: string;
    coachingStyle?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    isPubliclyVisible?: boolean;
}
export interface SubmitVettingInput {
    userId: string;
    credentialDocuments?: Record<string, unknown>;
}
export interface PublicCoachProfile {
    id: string;
    userId: string;
    bio: string | null;
    credentials: string | null;
    coachingStyle: string | null;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
    verificationStatus: CoachVerificationStatus;
    totalSales: number;
    averageRating: number | null;
    totalReviews: number;
    user: {
        name: string | null;
        image: string | null;
    };
}
/**
 * Implementation Coach Service
 */
declare class CoachService implements ICoachService {
    /**
     * Get coach profile by user ID
     */
    getProfile(userId: string): Promise<coach_profiles | null>;
    /**
     * Create new coach profile
     */
    createProfile(data: CreateCoachProfileInput): Promise<coach_profiles>;
    /**
     * Update coach profile
     */
    updateProfile(userId: string, data: UpdateCoachProfileInput): Promise<coach_profiles>;
    /**
     * Get public coach profile (for marketplace)
     */
    getPublicProfile(userId: string): Promise<PublicCoachProfile | null>;
    /**
     * Submit vetting request
     */
    submitVettingRequest(data: SubmitVettingInput): Promise<coach_vetting_requests>;
    /**
     * Get vetting request for user
     */
    getVettingRequest(userId: string): Promise<coach_vetting_requests | null>;
    /**
     * Update vetting request status
     */
    updateVettingStatus(requestId: string, status: VettingStatus, reviewNotes?: string, reviewedBy?: string): Promise<coach_vetting_requests>;
    /**
     * Update coach statistics (sales, ratings)
     */
    updateCoachStats(userId: string): Promise<coach_profiles>;
}
/**
 * Export singleton instance
 */
export declare const coachService: CoachService;
export {};

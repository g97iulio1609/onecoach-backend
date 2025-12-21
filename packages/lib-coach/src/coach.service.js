/**
 * Coach Service
 *
 * CRUD operations for coach profiles and vetting
 * Implements SOLID principles (SRP, DIP)
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
/**
 * Implementation Coach Service
 */
class CoachService {
    /**
     * Get coach profile by user ID
     */
    async getProfile(userId) {
        return await prisma.coach_profiles.findUnique({
            where: { userId },
        });
    }
    /**
     * Create new coach profile
     */
    async createProfile(data) {
        return await prisma.coach_profiles.create({
            data: {
                ...data,
                verificationStatus: 'PENDING',
                isPubliclyVisible: false,
                totalSales: 0,
                totalReviews: 0,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Update coach profile
     */
    async updateProfile(userId, data) {
        return await prisma.coach_profiles.update({
            where: { userId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Get public coach profile (for marketplace)
     */
    async getPublicProfile(userId) {
        const profile = await prisma.coach_profiles.findUnique({
            where: { userId },
            include: {
                users: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });
        if (!profile || !profile.isPubliclyVisible) {
            return null;
        }
        return {
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio,
            credentials: profile.credentials,
            coachingStyle: profile.coachingStyle,
            linkedinUrl: profile.linkedinUrl,
            instagramUrl: profile.instagramUrl,
            websiteUrl: profile.websiteUrl,
            verificationStatus: profile.verificationStatus,
            totalSales: profile.totalSales,
            averageRating: profile.averageRating ? Number(profile.averageRating) : null,
            totalReviews: profile.totalReviews,
            user: {
                name: profile.users.name,
                image: profile.users.image,
            },
        };
    }
    /**
     * Submit vetting request
     */
    async submitVettingRequest(data) {
        return await prisma.coach_vetting_requests.create({
            data: {
                userId: data.userId,
                credentialDocuments: (data.credentialDocuments || {}),
                status: 'PENDING',
                submittedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Get vetting request for user
     */
    async getVettingRequest(userId) {
        return await prisma.coach_vetting_requests.findFirst({
            where: { userId },
            orderBy: { submittedAt: 'desc' },
        });
    }
    /**
     * Update vetting request status
     */
    async updateVettingStatus(requestId, status, reviewNotes, reviewedBy) {
        const request = await prisma.coach_vetting_requests.update({
            where: { id: requestId },
            data: {
                status,
                reviewNotes,
                reviewedBy,
                reviewedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // Update coach profile verification status if approved
        if (status === 'APPROVED') {
            await prisma.coach_profiles.update({
                where: { userId: request.userId },
                data: {
                    verificationStatus: 'APPROVED',
                    updatedAt: new Date(),
                },
            });
        }
        else if (status === 'REJECTED') {
            await prisma.coach_profiles.update({
                where: { userId: request.userId },
                data: {
                    verificationStatus: 'REJECTED',
                    updatedAt: new Date(),
                },
            });
        }
        return request;
    }
    /**
     * Update coach statistics (sales, ratings)
     */
    async updateCoachStats(userId) {
        // Get marketplace plans for this coach
        const plans = await prisma.marketplace_plans.findMany({
            where: { coachId: userId },
            include: {
                plan_ratings: true,
                plan_purchases: {
                    where: { status: 'COMPLETED' },
                },
            },
        });
        // Calculate total sales
        const totalSales = plans.reduce((sum, plan) => sum + plan.plan_purchases.length, 0);
        // Calculate average rating and total reviews
        const allRatings = plans.flatMap((plan) => plan.plan_ratings);
        const totalReviews = allRatings.length;
        const averageRating = totalReviews > 0
            ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : null;
        // Update coach profile
        return await prisma.coach_profiles.update({
            where: { userId },
            data: {
                totalSales,
                averageRating,
                totalReviews,
                updatedAt: new Date(),
            },
        });
    }
}
/**
 * Export singleton instance
 */
export const coachService = new CoachService();

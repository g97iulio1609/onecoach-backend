/**
 * Marketplace Service
 *
 * CRUD operations for marketplace plans, purchases, and ratings
 * Implements SOLID principles (SRP, DIP)
 */
import { prisma } from '@onecoach/lib-core/prisma';
/**
 * Implementation Marketplace Service
 */
class MarketplaceService {
    /**
     * Create marketplace plan
     */
    async createPlan(data) {
        return await prisma.marketplace_plans.create({
            data: {
                ...data,
                currency: data.currency || 'EUR',
                isPublished: false,
                totalPurchases: 0,
                totalReviews: 0,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Update marketplace plan
     */
    async updatePlan(planId, data) {
        return await prisma.marketplace_plans.update({
            where: { id: planId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Delete marketplace plan
     */
    async deletePlan(planId) {
        await prisma.marketplace_plans.delete({
            where: { id: planId },
        });
    }
    /**
     * Get marketplace plan with details
     */
    async getPlan(planId) {
        const plan = await prisma.marketplace_plans.findUnique({
            where: { id: planId },
            include: {
                coach: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        coach_profile: {
                            select: {
                                bio: true,
                                verificationStatus: true,
                                averageRating: true,
                                totalReviews: true,
                            },
                        },
                    },
                },
                workout_program: {
                    select: {
                        name: true,
                        description: true,
                        difficulty: true,
                        durationWeeks: true,
                    },
                },
                nutrition_plan: {
                    select: {
                        name: true,
                        description: true,
                        durationWeeks: true,
                    },
                },
            },
        });
        if (!plan)
            return null;
        // Map to contract format: coach.id and coach.userId are both users.id
        return {
            ...plan,
            coach: plan.coach
                ? {
                    id: plan.coach.id,
                    userId: plan.coach.id, // coach.id is users.id
                    bio: plan.coach.coach_profile?.bio || null,
                }
                : undefined,
        };
    }
    /**
     * List marketplace plans with filters
     */
    async listPlans(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = { isPublished: true };
        if (filters.planType) {
            where.planType = filters.planType;
        }
        if (filters.coachId) {
            where.coachId = filters.coachId;
        }
        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice)
                where.price.gte = filters.minPrice;
            if (filters.maxPrice)
                where.price.lte = filters.maxPrice;
        }
        if (filters.minRating) {
            where.averageRating = { gte: filters.minRating };
        }
        if (filters.searchQuery) {
            where.OR = [
                { title: { contains: filters.searchQuery, mode: 'insensitive' } },
                { description: { contains: filters.searchQuery, mode: 'insensitive' } },
            ];
        }
        // Build orderBy clause
        let orderBy = { createdAt: 'desc' };
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'rating':
                    orderBy = { averageRating: filters.sortOrder || 'desc' };
                    break;
                case 'price':
                    orderBy = { price: filters.sortOrder || 'asc' };
                    break;
                case 'popular':
                    orderBy = { totalPurchases: 'desc' };
                    break;
                case 'recent':
                    orderBy = { publishedAt: 'desc' };
                    break;
            }
        }
        // Execute queries
        const [plans, total] = await Promise.all([
            prisma.marketplace_plans.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    coach: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            coach_profile: {
                                select: {
                                    bio: true,
                                    verificationStatus: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.marketplace_plans.count({ where }),
        ]);
        // Map plans to contract format
        const mappedPlans = plans.map((plan) => ({
            ...plan,
            coach: plan.coach
                ? {
                    id: plan.coach.id,
                    userId: plan.coach.id, // coach.id is users.id
                    bio: plan.coach.coach_profile?.bio || null,
                }
                : undefined,
        }));
        return {
            plans: mappedPlans,
            total,
            page,
            limit,
            hasMore: skip + plans.length < total,
        };
    }
    /**
     * Publish marketplace plan
     */
    async publishPlan(planId) {
        return await prisma.marketplace_plans.update({
            where: { id: planId },
            data: {
                isPublished: true,
                publishedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Unpublish marketplace plan
     */
    async unpublishPlan(planId) {
        return await prisma.marketplace_plans.update({
            where: { id: planId },
            data: {
                isPublished: false,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Create purchase
     */
    async createPurchase(data) {
        // Get plan details for commission calculation
        const plan = await prisma.marketplace_plans.findUnique({
            where: { id: data.marketplacePlanId },
        });
        if (!plan) {
            throw new Error('Plan not found');
        }
        // Calculate commission split (70% coach, 30% platform)
        const coachCommission = Number(plan.price) * 0.7;
        const platformCommission = Number(plan.price) * 0.3;
        return await prisma.plan_purchases.create({
            data: {
                ...data,
                coachCommission,
                platformCommission,
                status: 'PENDING',
            },
        });
    }
    /**
     * Get purchase by ID
     */
    async getPurchase(purchaseId) {
        return await prisma.plan_purchases.findUnique({
            where: { id: purchaseId },
        });
    }
    /**
     * Get user purchases
     */
    async getUserPurchases(userId) {
        return await prisma.plan_purchases.findMany({
            where: { userId },
            orderBy: { purchasedAt: 'desc' },
        });
    }
    /**
     * Update purchase status
     */
    async updatePurchaseStatus(purchaseId, status) {
        const purchase = await prisma.plan_purchases.update({
            where: { id: purchaseId },
            data: { status },
        });
        // If completed, increment plan purchase count
        if (status === 'COMPLETED') {
            await prisma.marketplace_plans.update({
                where: { id: purchase.marketplacePlanId },
                data: {
                    totalPurchases: { increment: 1 },
                },
            });
        }
        return purchase;
    }
    /**
     * Rate a plan
     */
    async ratePlan(data) {
        const rating = await prisma.plan_ratings.upsert({
            where: {
                userId_marketplacePlanId: {
                    userId: data.userId,
                    marketplacePlanId: data.marketplacePlanId,
                },
            },
            update: {
                rating: data.rating,
                review: data.review,
                updatedAt: new Date(),
            },
            create: {
                ...data,
                updatedAt: new Date(),
            },
        });
        // Update plan statistics
        await this.updatePlanStats(data.marketplacePlanId);
        return rating;
    }
    /**
     * Get plan ratings
     */
    async getPlanRatings(planId) {
        return await prisma.plan_ratings.findMany({
            where: { marketplacePlanId: planId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Update plan statistics (rating, reviews)
     */
    async updatePlanStats(planId) {
        const ratings = await prisma.plan_ratings.findMany({
            where: { marketplacePlanId: planId },
        });
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : null;
        return await prisma.marketplace_plans.update({
            where: { id: planId },
            data: {
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
export const marketplaceService = new MarketplaceService();

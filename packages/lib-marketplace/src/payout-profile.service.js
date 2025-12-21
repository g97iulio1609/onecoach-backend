import { prisma } from '@onecoach/lib-core/prisma';
export class PayoutProfileService {
    static async getProfile(userId) {
        return prisma.user_payout_profiles.findUnique({ where: { userId } });
    }
    static async upsertProfile(userId, data) {
        const existing = await prisma.user_payout_profiles.findUnique({ where: { userId } });
        if (existing) {
            return prisma.user_payout_profiles.update({ where: { userId }, data });
        }
        return prisma.user_payout_profiles.create({ data: { userId, ...data } });
    }
}

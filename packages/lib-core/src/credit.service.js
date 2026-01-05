/**
 * Credit Service
 *
 * Gestione crediti utente e transazioni
 * Implementa ICreditService contract
 */
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
/**
 * Implementazione Credit Service
 */
export class CreditService {
    async getCreditBalance(userId) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { credits: true },
        });
        return Number(user?.credits ?? 0);
    }
    async checkCredits(userId, amount) {
        const hasUnlimitedCredits = await this.hasUnlimitedCredits(userId);
        if (hasUnlimitedCredits) {
            return true;
        }
        const balance = await this.getCreditBalance(userId);
        return balance >= amount;
    }
    async consumeCredits(params) {
        const hasUnlimitedCredits = await this.hasUnlimitedCredits(params.userId);
        if (hasUnlimitedCredits) {
            return true;
        }
        const hasEnough = await this.checkCredits(params.userId, params.amount);
        if (!hasEnough) {
            return false;
        }
        await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.users.update({
                where: { id: params.userId },
                data: {
                    credits: {
                        decrement: params.amount,
                    },
                },
                select: { credits: true },
            });
            await tx.credit_transactions.create({
                data: {
                    userId: params.userId,
                    amount: -params.amount,
                    type: params.type,
                    description: params.description,
                    metadata: params.metadata,
                    balanceAfter: updatedUser.credits,
                },
            });
        });
        return true;
    }
    async addCredits(params) {
        await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.users.update({
                where: { id: params.userId },
                data: {
                    credits: {
                        increment: params.amount,
                    },
                },
                select: { credits: true },
            });
            await tx.credit_transactions.create({
                data: {
                    userId: params.userId,
                    amount: params.amount,
                    type: params.type,
                    description: params.description,
                    metadata: params.metadata,
                    balanceAfter: updatedUser.credits,
                },
            });
        });
    }
    async getTransactionHistory(userId, limit = 50) {
        const transactions = await prisma.credit_transactions.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                userId: true,
                amount: true,
                type: true,
                description: true,
                createdAt: true,
            },
        });
        return transactions.filter((t) => t.userId !== null);
    }
    async getCreditStats(userId) {
        // Optimized: Use aggregate queries instead of fetching all transactions
        const [user, transactions, addedResult, consumedResult] = await Promise.all([
            prisma.users.findUnique({
                where: { id: userId },
                select: {
                    credits: true,
                    subscriptions: {
                        select: {
                            status: true,
                            plan: true,
                        },
                        where: {
                            status: 'ACTIVE',
                        },
                        take: 1,
                    },
                },
            }),
            prisma.credit_transactions.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    amount: true,
                    type: true,
                    createdAt: true,
                },
            }),
            // Aggregate query for total added credits
            prisma.credit_transactions.aggregate({
                where: { userId, amount: { gt: 0 } },
                _sum: { amount: true },
            }),
            // Aggregate query for total consumed credits
            prisma.credit_transactions.aggregate({
                where: { userId, amount: { lt: 0 } },
                _sum: { amount: true },
            }),
        ]);
        const balance = user?.credits ?? 0;
        const hasUnlimitedCredits = user?.subscriptions?.[0]?.status === 'ACTIVE' && user?.subscriptions?.[0]?.plan === 'PRO';
        // Totals calculated via aggregate queries (more efficient than fetching all records)
        const totalAdded = Number(addedResult._sum.amount ?? 0);
        const totalConsumed = Math.abs(Number(consumedResult._sum.amount ?? 0));
        const lastTransaction = transactions[0]
            ? {
                id: transactions[0].id,
                type: transactions[0].amount > 0 ? 'ADDED' : 'CONSUMED',
                amount: Math.abs(transactions[0].amount),
                createdAt: transactions[0].createdAt,
            }
            : null;
        return {
            balance: Number(balance),
            hasUnlimitedCredits,
            totalAdded: Number(totalAdded),
            totalConsumed: Number(totalConsumed),
            lastTransaction: lastTransaction
                ? {
                    ...lastTransaction,
                    amount: Number(lastTransaction.amount),
                }
                : undefined,
        };
    }
    /**
     * Metodo statico per compatibilità con codice esistente
     */
    static async getCreditStats(userId) {
        const instance = new CreditService();
        return instance.getCreditStats(userId);
    }
    async hasUnlimitedCredits(userId) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                subscriptions: {
                    select: {
                        status: true,
                        plan: true,
                    },
                    where: {
                        status: 'ACTIVE',
                    },
                    take: 1,
                },
            },
        });
        const activeSubscription = user?.subscriptions?.[0];
        return activeSubscription?.status === 'ACTIVE' && activeSubscription.plan === 'PRO';
    }
    async getCreditHistory(userId, limit = 100) {
        const history = await prisma.credit_transactions.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return history;
    }
}
export const creditService = new CreditService();

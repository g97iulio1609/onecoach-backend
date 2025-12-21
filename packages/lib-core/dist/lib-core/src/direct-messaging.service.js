/**
 * Direct Messaging Service
 *
 * CRUD operations for direct messaging between coach and athlete
 * Implements SOLID principles (SRP, DIP)
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
/**
 * Implementation Direct Messaging Service
 */
class DirectMessagingService {
    /**
     * Create or get existing conversation
     */
    async createConversation(coachId, athleteId, title) {
        // Check if conversation already exists
        const existing = await prisma.direct_conversations.findUnique({
            where: {
                coachId_athleteId: {
                    coachId,
                    athleteId,
                },
            },
        });
        if (existing) {
            return existing;
        }
        // Create new conversation
        return await prisma.direct_conversations.create({
            data: {
                id: createId(),
                coachId,
                athleteId,
                title: title || null,
                priority: 'MEDIUM',
                isMuted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Get conversation by ID
     */
    async getConversation(conversationId) {
        return await prisma.direct_conversations.findUnique({
            where: { id: conversationId },
        });
    }
    /**
     * Get conversation by participants
     */
    async getConversationByParticipants(coachId, athleteId) {
        return await prisma.direct_conversations.findUnique({
            where: {
                coachId_athleteId: {
                    coachId,
                    athleteId,
                },
            },
        });
    }
    /**
     * Get conversations for user (coach or athlete)
     */
    async getConversations(userId, role) {
        const where = role === 'COACH' ? { coachId: userId } : { athleteId: userId };
        const conversations = await prisma.direct_conversations.findMany({
            where,
            include: {
                coach: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    },
                },
                athlete: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ priority: 'desc' }, { lastMessageAt: 'desc' }, { createdAt: 'desc' }],
        });
        // Batch calculate unread counts in a single query
        const conversationIds = conversations.map((c) => c.id);
        const unreadCounts = await this.batchGetUnreadCounts(conversationIds, userId);
        // Map unread counts to conversations
        return conversations.map((conv) => ({
            ...conv,
            unreadCount: unreadCounts.get(conv.id) ?? 0,
            lastMessage: conv.messages[0] || null,
        }));
    }
    /**
     * Batch get unread counts for multiple conversations (optimized)
     */
    async batchGetUnreadCounts(conversationIds, userId) {
        if (conversationIds.length === 0) {
            return new Map();
        }
        // Single optimized query with LEFT JOIN to count unread messages
        const results = await prisma.$queryRaw `
      SELECT 
        dm."conversationId",
        COUNT(dm.id) as "unreadCount"
      FROM direct_messages dm
      LEFT JOIN message_reads mr ON dm.id = mr."messageId" AND mr."userId" = ${userId}::uuid
      WHERE 
        dm."conversationId" IN (${Prisma.join(conversationIds)})
        AND dm."senderId" != ${userId}::uuid
        AND mr.id IS NULL
      GROUP BY dm."conversationId"
    `;
        const countMap = new Map();
        for (const row of results) {
            countMap.set(row.conversationId, Number(row.unreadCount));
        }
        return countMap;
    }
    /**
     * Update conversation settings (mute, priority)
     */
    async updateConversationSettings(conversationId, data) {
        return await prisma.direct_conversations.update({
            where: { id: conversationId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Delete conversation
     */
    async deleteConversation(conversationId) {
        await prisma.direct_conversations.delete({
            where: { id: conversationId },
        });
    }
    /**
     * Send message
     */
    async sendMessage(conversationId, senderId, content, isImportant = false) {
        // Create message and update conversation in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create message
            const message = await tx.direct_messages.create({
                data: {
                    id: createId(),
                    conversationId,
                    senderId,
                    content,
                    isImportant,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            // Update conversation lastMessageAt
            await tx.direct_conversations.update({
                where: { id: conversationId },
                data: {
                    lastMessageAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            return message;
        });
        return result;
    }
    /**
     * Get messages with pagination
     */
    async getMessages(conversationId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const messages = await prisma.direct_messages.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                reads: {
                    select: {
                        userId: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        // Map to include isRead flag
        return messages.map((msg) => ({
            ...msg,
            isRead: msg.reads.length > 0,
        }));
    }
    /**
     * Get single message
     */
    async getMessage(messageId) {
        return await prisma.direct_messages.findUnique({
            where: { id: messageId },
        });
    }
    /**
     * Mark message as important
     */
    async markMessageImportant(messageId, isImportant) {
        return await prisma.direct_messages.update({
            where: { id: messageId },
            data: {
                isImportant,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Report message
     */
    async reportMessage(messageId, reason) {
        return await prisma.direct_messages.update({
            where: { id: messageId },
            data: {
                isReported: true,
                reportedReason: reason,
                reportedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Delete message
     */
    async deleteMessage(messageId) {
        await prisma.direct_messages.delete({
            where: { id: messageId },
        });
    }
    /**
     * Mark message as read
     */
    async markAsRead(messageId, userId) {
        // Check if already read
        const existing = await prisma.message_reads.findUnique({
            where: {
                messageId_userId: {
                    messageId,
                    userId,
                },
            },
        });
        if (existing) {
            return existing;
        }
        // Create read record
        return await prisma.message_reads.create({
            data: {
                id: createId(),
                messageId,
                userId,
                readAt: new Date(),
            },
        });
    }
    /**
     * Get unread count for a conversation (optimized with single query)
     */
    async getUnreadCount(conversationId, userId) {
        // Single optimized query: count messages not sent by user and not read
        const result = await prisma.$queryRaw `
      SELECT COUNT(dm.id) as count
      FROM direct_messages dm
      LEFT JOIN message_reads mr ON dm.id = mr."messageId" AND mr."userId" = ${userId}::uuid
      WHERE 
        dm."conversationId" = ${conversationId}
        AND dm."senderId" != ${userId}::uuid
        AND mr.id IS NULL
    `;
        return Number(result[0]?.count ?? 0);
    }
    /**
     * Get total unread count for user across all conversations (optimized)
     */
    async getUnreadCountForUser(userId) {
        // Single optimized query: count all unread messages across all user's conversations
        const result = await prisma.$queryRaw `
      SELECT COUNT(dm.id) as count
      FROM direct_messages dm
      INNER JOIN direct_conversations dc ON dm."conversationId" = dc.id
      LEFT JOIN message_reads mr ON dm.id = mr."messageId" AND mr."userId" = ${userId}::uuid
      WHERE 
        (dc."coachId" = ${userId}::uuid OR dc."athleteId" = ${userId}::uuid)
        AND dm."senderId" != ${userId}::uuid
        AND mr.id IS NULL
    `;
        return Number(result[0]?.count ?? 0);
    }
}
/**
 * Export singleton instance
 */
export const directMessagingService = new DirectMessagingService();

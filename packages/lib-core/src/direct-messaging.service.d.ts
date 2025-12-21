/**
 * Direct Messaging Service
 *
 * CRUD operations for direct messaging between coach and athlete
 * Implements SOLID principles (SRP, DIP)
 */
import type { direct_conversations, direct_messages, message_reads, ConversationPriority } from '@prisma/client';
/**
 * Interface for Direct Messaging Service
 */
export interface IDirectMessagingService {
    createConversation(coachId: string, athleteId: string, title?: string): Promise<direct_conversations>;
    getConversation(conversationId: string): Promise<direct_conversations | null>;
    getConversationByParticipants(coachId: string, athleteId: string): Promise<direct_conversations | null>;
    getConversations(userId: string, role: 'COACH' | 'USER'): Promise<DirectConversationWithUser[]>;
    updateConversationSettings(conversationId: string, data: {
        isMuted?: boolean;
        priority?: ConversationPriority;
    }): Promise<direct_conversations>;
    deleteConversation(conversationId: string): Promise<void>;
    sendMessage(conversationId: string, senderId: string, content: string, isImportant?: boolean): Promise<direct_messages>;
    getMessages(conversationId: string, page?: number, limit?: number): Promise<DirectMessageWithSender[]>;
    getMessage(messageId: string): Promise<direct_messages | null>;
    markMessageImportant(messageId: string, isImportant: boolean): Promise<direct_messages>;
    reportMessage(messageId: string, reason: string): Promise<direct_messages>;
    deleteMessage(messageId: string): Promise<void>;
    markAsRead(messageId: string, userId: string): Promise<message_reads>;
    getUnreadCount(conversationId: string, userId: string): Promise<number>;
    getUnreadCountForUser(userId: string): Promise<number>;
}
/**
 * Extended types with user information
 */
export interface DirectConversationWithUser extends direct_conversations {
    coach: {
        id: string;
        name: string | null;
        image: string | null;
        email: string;
    };
    athlete: {
        id: string;
        name: string | null;
        image: string | null;
        email: string;
    };
    unreadCount?: number;
    lastMessage?: direct_messages | null;
}
export interface DirectMessageWithSender extends direct_messages {
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
    isRead?: boolean;
}
/**
 * Implementation Direct Messaging Service
 */
declare class DirectMessagingService implements IDirectMessagingService {
    /**
     * Create or get existing conversation
     */
    createConversation(coachId: string, athleteId: string, title?: string): Promise<direct_conversations>;
    /**
     * Get conversation by ID
     */
    getConversation(conversationId: string): Promise<direct_conversations | null>;
    /**
     * Get conversation by participants
     */
    getConversationByParticipants(coachId: string, athleteId: string): Promise<direct_conversations | null>;
    /**
     * Get conversations for user (coach or athlete)
     */
    getConversations(userId: string, role: 'COACH' | 'USER'): Promise<DirectConversationWithUser[]>;
    /**
     * Batch get unread counts for multiple conversations (optimized)
     */
    private batchGetUnreadCounts;
    /**
     * Update conversation settings (mute, priority)
     */
    updateConversationSettings(conversationId: string, data: {
        isMuted?: boolean;
        priority?: ConversationPriority;
    }): Promise<direct_conversations>;
    /**
     * Delete conversation
     */
    deleteConversation(conversationId: string): Promise<void>;
    /**
     * Send message
     */
    sendMessage(conversationId: string, senderId: string, content: string, isImportant?: boolean): Promise<direct_messages>;
    /**
     * Get messages with pagination
     */
    getMessages(conversationId: string, page?: number, limit?: number): Promise<DirectMessageWithSender[]>;
    /**
     * Get single message
     */
    getMessage(messageId: string): Promise<direct_messages | null>;
    /**
     * Mark message as important
     */
    markMessageImportant(messageId: string, isImportant: boolean): Promise<direct_messages>;
    /**
     * Report message
     */
    reportMessage(messageId: string, reason: string): Promise<direct_messages>;
    /**
     * Delete message
     */
    deleteMessage(messageId: string): Promise<void>;
    /**
     * Mark message as read
     */
    markAsRead(messageId: string, userId: string): Promise<message_reads>;
    /**
     * Get unread count for a conversation (optimized with single query)
     */
    getUnreadCount(conversationId: string, userId: string): Promise<number>;
    /**
     * Get total unread count for user across all conversations (optimized)
     */
    getUnreadCountForUser(userId: string): Promise<number>;
}
/**
 * Export singleton instance
 */
export declare const directMessagingService: DirectMessagingService;
export {};

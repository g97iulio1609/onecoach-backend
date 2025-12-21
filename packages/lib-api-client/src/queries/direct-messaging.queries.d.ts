/**
 * Direct Messaging Query Keys and Functions
 *
 * Standardized query keys and query functions for direct messaging queries
 */
import type { direct_conversations, direct_messages, ConversationPriority } from '@prisma/client';
import type { DirectConversationWithUser, DirectMessageWithSender } from '@onecoach/lib-core';
export declare const directMessagingKeys: {
    readonly all: readonly ["direct-messaging"];
    readonly conversations: (userId: string, role: "COACH" | "USER") => readonly ["direct-messaging", "conversations", string, "USER" | "COACH"];
    readonly conversation: (id: string) => readonly ["direct-messaging", "conversation", string];
    readonly messages: (conversationId: string, page?: number, limit?: number) => readonly ["direct-messaging", "messages", string, number | undefined, number | undefined];
    readonly unreadCount: (userId: string) => readonly ["direct-messaging", "unread-count", string];
};
export interface DirectConversationsResponse {
    conversations: DirectConversationWithUser[];
}
export interface DirectMessagesResponse {
    messages: DirectMessageWithSender[];
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface UnreadCountResponse {
    count: number;
}
export declare const directMessagingQueries: {
    /**
     * Get user's conversations
     */
    getConversations: (_userId: string, _role: "COACH" | "USER") => Promise<DirectConversationsResponse>;
    /**
     * Get conversation details
     */
    getConversation: (id: string) => Promise<DirectConversationWithUser>;
    /**
     * Get messages for a conversation
     */
    getMessages: (conversationId: string, page?: number, limit?: number) => Promise<DirectMessagesResponse>;
    /**
     * Get unread count for user
     */
    getUnreadCount: (_userId: string) => Promise<UnreadCountResponse>;
};
export declare const directMessagingMutations: {
    /**
     * Create new conversation
     */
    createConversation: (data: {
        athleteId: string;
        title?: string;
    }) => Promise<direct_conversations>;
    /**
     * Update conversation settings
     */
    updateConversationSettings: (conversationId: string, data: {
        isMuted?: boolean;
        priority?: ConversationPriority;
    }) => Promise<direct_conversations>;
    /**
     * Delete conversation
     */
    deleteConversation: (conversationId: string) => Promise<void>;
    /**
     * Send message
     */
    sendMessage: (conversationId: string, data: {
        content: string;
        isImportant?: boolean;
    }) => Promise<direct_messages>;
    /**
     * Mark message as important
     */
    markMessageImportant: (messageId: string, isImportant: boolean) => Promise<direct_messages>;
    /**
     * Report message
     */
    reportMessage: (messageId: string, reason: string) => Promise<direct_messages>;
    /**
     * Delete message
     */
    deleteMessage: (messageId: string) => Promise<void>;
    /**
     * Mark message as read
     */
    markAsRead: (messageId: string) => Promise<void>;
};
//# sourceMappingURL=direct-messaging.queries.d.ts.map
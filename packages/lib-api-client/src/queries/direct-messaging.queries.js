/**
 * Direct Messaging Query Keys and Functions
 *
 * Standardized query keys and query functions for direct messaging queries
 */
// ============================================================================
// Query Keys
// ============================================================================
export const directMessagingKeys = {
    all: ['direct-messaging'],
    conversations: (userId, role) => [...directMessagingKeys.all, 'conversations', userId, role],
    conversation: (id) => [...directMessagingKeys.all, 'conversation', id],
    messages: (conversationId, page, limit) => [...directMessagingKeys.all, 'messages', conversationId, page, limit],
    unreadCount: (userId) => [...directMessagingKeys.all, 'unread-count', userId],
};
// ============================================================================
// Query Functions
// ============================================================================
export const directMessagingQueries = {
    /**
     * Get user's conversations
     */
    getConversations: async (_userId, _role) => {
        const response = await fetch(`/api/direct-messaging/conversations`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch conversations');
        }
        return response.json();
    },
    /**
     * Get conversation details
     */
    getConversation: async (id) => {
        const response = await fetch(`/api/direct-messaging/conversations/${id}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch conversation');
        }
        return response.json();
    },
    /**
     * Get messages for a conversation
     */
    getMessages: async (conversationId, page = 1, limit = 50) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        const response = await fetch(`/api/direct-messaging/conversations/${conversationId}/messages?${params.toString()}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch messages');
        }
        return response.json();
    },
    /**
     * Get unread count for user
     */
    getUnreadCount: async (_userId) => {
        // This would need a dedicated endpoint, for now return 0
        // TODO: Create /api/direct-messaging/unread-count endpoint
        return { count: 0 };
    },
};
// ============================================================================
// Mutation Functions
// ============================================================================
export const directMessagingMutations = {
    /**
     * Create new conversation
     */
    createConversation: async (data) => {
        const response = await fetch(`/api/direct-messaging/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create conversation');
        }
        return response.json();
    },
    /**
     * Update conversation settings
     */
    updateConversationSettings: async (conversationId, data) => {
        const response = await fetch(`/api/direct-messaging/conversations/${conversationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update conversation');
        }
        return response.json();
    },
    /**
     * Delete conversation
     */
    deleteConversation: async (conversationId) => {
        const response = await fetch(`/api/direct-messaging/conversations/${conversationId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to delete conversation');
        }
    },
    /**
     * Send message
     */
    sendMessage: async (conversationId, data) => {
        const response = await fetch(`/api/direct-messaging/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to send message');
        }
        return response.json();
    },
    /**
     * Mark message as important
     */
    markMessageImportant: async (messageId, isImportant) => {
        const response = await fetch(`/api/direct-messaging/messages/${messageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isImportant }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update message');
        }
        return response.json();
    },
    /**
     * Report message
     */
    reportMessage: async (messageId, reason) => {
        const response = await fetch(`/api/direct-messaging/messages/${messageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ report: true, reason }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to report message');
        }
        return response.json();
    },
    /**
     * Delete message
     */
    deleteMessage: async (messageId) => {
        const response = await fetch(`/api/direct-messaging/messages/${messageId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to delete message');
        }
    },
    /**
     * Mark message as read
     */
    markAsRead: async (messageId) => {
        const response = await fetch(`/api/direct-messaging/messages/${messageId}/read`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to mark message as read');
        }
    },
};

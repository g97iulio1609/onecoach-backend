/**
 * Direct Messaging React Query Hooks
 *
 * Custom hooks for direct messaging queries and mutations
 */
import type { DirectConversationsResponse, DirectMessagesResponse } from '../queries/direct-messaging.queries';
import type { ConversationPriority } from '@prisma/client';
/**
 * Hook to get user's conversations
 *
 * @param userId - User ID
 * @param role - User role ('COACH' or 'USER')
 * @returns Query result with conversations
 */
export declare function useDirectConversations(userId: string | null, role: 'COACH' | 'USER' | null): import("@tanstack/react-query").UseQueryResult<DirectConversationsResponse, Error>;
/**
 * Hook to get conversation details
 *
 * @param conversationId - Conversation ID
 * @returns Query result with conversation
 */
export declare function useDirectConversation(conversationId: string | null): import("@tanstack/react-query").UseQueryResult<import("@onecoach/lib-core").DirectConversationWithUser, Error>;
/**
 * Hook to get messages for a conversation
 *
 * @param conversationId - Conversation ID
 * @param page - Page number (default: 1)
 * @param limit - Messages per page (default: 50)
 * @returns Query result with messages
 */
export declare function useDirectMessages(conversationId: string | null, page?: number, limit?: number): import("@tanstack/react-query").UseQueryResult<DirectMessagesResponse, Error>;
/**
 * Hook to create a new conversation
 *
 * @returns Mutation function
 */
export declare function useCreateDirectConversation(): import("@tanstack/react-query").UseMutationResult<{
    priority: import("@prisma/client").$Enums.ConversationPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string | null;
    lastMessageAt: Date | null;
    coachId: string;
    athleteId: string;
    isMuted: boolean;
}, Error, {
    athleteId: string;
    title?: string;
}, unknown>;
/**
 * Hook to update conversation settings
 *
 * @returns Mutation function
 */
export declare function useUpdateConversationSettings(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    conversationId: string;
    data: {
        isMuted?: boolean;
        priority?: ConversationPriority;
    };
}, unknown>;
/**
 * Hook to delete a conversation
 *
 * @returns Mutation function
 */
export declare function useDeleteDirectConversation(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
/**
 * Hook to send a message
 *
 * @returns Mutation function
 */
export declare function useSendDirectMessage(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    conversationId: string;
    content: string;
    isImportant?: boolean;
}, unknown>;
/**
 * Hook to mark message as important
 *
 * @returns Mutation function
 */
export declare function useMarkMessageImportant(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    messageId: string;
    conversationId: string;
    isImportant: boolean;
}, unknown>;
/**
 * Hook to report a message
 *
 * @returns Mutation function
 */
export declare function useReportMessage(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    messageId: string;
    conversationId: string;
    reason: string;
}, unknown>;
/**
 * Hook to delete a message
 *
 * @returns Mutation function
 */
export declare function useDeleteDirectMessage(): import("@tanstack/react-query").UseMutationResult<void, Error, {
    messageId: string;
    conversationId: string;
}, unknown>;
/**
 * Hook to mark message as read
 *
 * @returns Mutation function
 */
export declare function useMarkMessageAsRead(): import("@tanstack/react-query").UseMutationResult<void, Error, {
    messageId: string;
    conversationId: string;
}, unknown>;
//# sourceMappingURL=use-direct-messaging.d.ts.map
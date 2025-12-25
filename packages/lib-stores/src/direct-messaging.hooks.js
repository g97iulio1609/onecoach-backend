/**
 * Direct Messaging Realtime Hooks
 *
 * Hook React per sincronizzazione realtime di conversazioni e messaggi diretti.
 * Seguono i principi KISS e DRY, wrappando la logica comune.
 */
'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription, useRealtimeSyncWithClient } from './realtime.hooks';
import { logger } from '@onecoach/lib-core';
/**
 * Hook per sottoscrivere a eventi realtime sulle conversazioni dirette.
 *
 * @example
 * ```tsx
 * useDirectConversationsRealtime({
 *   userId: user.id,
 *   role: user.role === 'COACH' ? 'COACH' : 'USER',
 *   onConversationUpdated: (conv) => {
 *     logger.warn('Conversation updated:', conv);
 *   },
 * });
 * ```
 */
export function useDirectConversationsRealtime({ userId, role, enabled = true, onConversationCreated, onConversationUpdated, onConversationDeleted, onError, }) {
    // Filtro basato sul ruolo
    const filter = role === 'COACH' ? `coachId=eq.${userId}` : `athleteId=eq.${userId}`;
    useRealtimeSubscription({
        table: 'direct_conversations',
        filter,
        enabled: enabled && !!userId,
        onInsert: onConversationCreated,
        onUpdate: onConversationUpdated,
        onDelete: onConversationDeleted,
        onError,
    });
}
/**
 * Hook per sottoscrivere a eventi realtime sui messaggi di una conversazione.
 *
 * @example
 * ```tsx
 * useDirectMessagesRealtime({
 *   conversationId: selectedConversation?.id,
 *   onMessageSent: (msg) => {
 *     logger.warn('New message:', msg);
 *     // Scroll to bottom, play sound, etc.
 *   },
 * });
 * ```
 */
export function useDirectMessagesRealtime({ conversationId, enabled = true, onMessageSent, onMessageUpdated, onMessageDeleted, onError, }) {
    const filter = conversationId ? `conversationId=eq.${conversationId}` : undefined;
    useRealtimeSubscription({
        table: 'direct_messages',
        filter,
        enabled: enabled && !!conversationId,
        onInsert: onMessageSent,
        onUpdate: onMessageUpdated,
        onDelete: onMessageDeleted,
        onError,
    });
}
/**
 * Hook combinato per sottoscrivere sia conversazioni che messaggi.
 * Utile quando si vuole sincronizzare tutto in un unico hook.
 *
 * @example
 * ```tsx
 * useDirectMessagingRealtime({
 *   userId: user.id,
 *   role: user.role === 'COACH' ? 'COACH' : 'USER',
 *   conversationId: selectedConversation?.id,
 *   onConversationUpdated: (conv) => updateConversation(conv),
 *   onMessageSent: (msg) => addMessage(msg),
 * });
 * ```
 */
export function useDirectMessagingRealtime({ userId, role, conversationId, enabled = true, onConversationCreated, onConversationUpdated, onConversationDeleted, onMessageSent, onMessageUpdated, onMessageDeleted, onError, }) {
    // Sottoscrizione conversazioni
    useDirectConversationsRealtime({
        userId,
        role,
        enabled,
        onConversationCreated,
        onConversationUpdated,
        onConversationDeleted,
        onError,
    });
    // Sottoscrizione messaggi
    useDirectMessagesRealtime({
        conversationId: conversationId || null,
        enabled,
        onMessageSent,
        onMessageUpdated,
        onMessageDeleted,
        onError,
    });
}
/**
 * Hook per sincronizzare conversazioni con React Query cache.
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * const { data: conversations } = useQuery({
 *   queryKey: ['direct-conversations', userId],
 *   queryFn: () => fetchConversations(userId, role),
 * });
 *
 * useDirectConversationsSync({
 *   userId,
 *   role,
 *   queryKey: ['direct-conversations', userId],
 *   queryClient,
 * });
 * ```
 */
export function useDirectConversationsSync({ userId, role, queryKey, queryClient, enabled = true, onSynced, }) {
    const filter = role === 'COACH' ? `coachId=eq.${userId}` : `athleteId=eq.${userId}`;
    useRealtimeSyncWithClient({
        table: 'direct_conversations',
        queryKey,
        queryClient,
        filter,
        enabled: enabled && !!userId,
        onSynced,
    });
}
/**
 * Hook per sincronizzare messaggi con React Query cache.
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * const { data: messages } = useQuery({
 *   queryKey: ['direct-messages', conversationId],
 *   queryFn: () => fetchMessages(conversationId),
 * });
 *
 * useDirectMessagesSync({
 *   conversationId,
 *   queryKey: ['direct-messages', conversationId],
 *   queryClient,
 * });
 * ```
 */
export function useDirectMessagesSync({ conversationId, queryKey, queryClient, enabled = true, onSynced, }) {
    const filter = conversationId ? `conversationId=eq.${conversationId}` : undefined;
    useRealtimeSyncWithClient({
        table: 'direct_messages',
        queryKey,
        queryClient,
        filter,
        enabled: enabled && !!conversationId,
        onSynced,
    });
}

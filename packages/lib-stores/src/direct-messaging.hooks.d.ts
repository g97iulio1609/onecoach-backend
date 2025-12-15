/**
 * Direct Messaging Realtime Hooks
 *
 * Hook React per sincronizzazione realtime di conversazioni e messaggi diretti.
 * Seguono i principi KISS e DRY, wrappando la logica comune.
 */
import { useQueryClient } from '@tanstack/react-query';
import type { direct_conversations, direct_messages } from '@prisma/client';
export interface UseDirectConversationsRealtimeOptions {
    /** User ID (coach o atleta) */
    userId: string;
    /** Role dell'utente ('COACH' o 'USER') */
    role: 'COACH' | 'USER';
    /** Abilita/disabilita (default: true) */
    enabled?: boolean;
    /** Callback quando una conversazione viene creata */
    onConversationCreated?: (conversation: direct_conversations) => void;
    /** Callback quando una conversazione viene aggiornata */
    onConversationUpdated?: (conversation: direct_conversations) => void;
    /** Callback quando una conversazione viene eliminata */
    onConversationDeleted?: (conversation: direct_conversations) => void;
    /** Callback per errori */
    onError?: (error: Error) => void;
}
/**
 * Hook per sottoscrivere a eventi realtime sulle conversazioni dirette.
 *
 * @example
 * ```tsx
 * useDirectConversationsRealtime({
 *   userId: user.id,
 *   role: user.role === 'COACH' ? 'COACH' : 'USER',
 *   onConversationUpdated: (conv) => {
 *     console.warn('Conversation updated:', conv);
 *   },
 * });
 * ```
 */
export declare function useDirectConversationsRealtime({ userId, role, enabled, onConversationCreated, onConversationUpdated, onConversationDeleted, onError, }: UseDirectConversationsRealtimeOptions): void;
export interface UseDirectMessagesRealtimeOptions {
    /** ID della conversazione */
    conversationId: string | null;
    /** Abilita/disabilita (default: true) */
    enabled?: boolean;
    /** Callback quando un messaggio viene inviato */
    onMessageSent?: (message: direct_messages) => void;
    /** Callback quando un messaggio viene aggiornato */
    onMessageUpdated?: (message: direct_messages) => void;
    /** Callback quando un messaggio viene eliminato */
    onMessageDeleted?: (message: direct_messages) => void;
    /** Callback per errori */
    onError?: (error: Error) => void;
}
/**
 * Hook per sottoscrivere a eventi realtime sui messaggi di una conversazione.
 *
 * @example
 * ```tsx
 * useDirectMessagesRealtime({
 *   conversationId: selectedConversation?.id,
 *   onMessageSent: (msg) => {
 *     console.warn('New message:', msg);
 *     // Scroll to bottom, play sound, etc.
 *   },
 * });
 * ```
 */
export declare function useDirectMessagesRealtime({ conversationId, enabled, onMessageSent, onMessageUpdated, onMessageDeleted, onError, }: UseDirectMessagesRealtimeOptions): void;
export interface UseDirectMessagingRealtimeOptions extends UseDirectConversationsRealtimeOptions {
    /** ID della conversazione corrente (opzionale) */
    conversationId?: string | null;
    /** Callback quando un messaggio viene inviato */
    onMessageSent?: (message: direct_messages) => void;
    /** Callback quando un messaggio viene aggiornato */
    onMessageUpdated?: (message: direct_messages) => void;
    /** Callback quando un messaggio viene eliminato */
    onMessageDeleted?: (message: direct_messages) => void;
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
export declare function useDirectMessagingRealtime({ userId, role, conversationId, enabled, onConversationCreated, onConversationUpdated, onConversationDeleted, onMessageSent, onMessageUpdated, onMessageDeleted, onError, }: UseDirectMessagingRealtimeOptions): void;
export interface UseDirectConversationsSyncOptions {
    /** User ID */
    userId: string;
    /** Role */
    role: 'COACH' | 'USER';
    /** Query key React Query */
    queryKey: readonly unknown[];
    /** QueryClient */
    queryClient: ReturnType<typeof useQueryClient>;
    /** Abilita/disabilita */
    enabled?: boolean;
    /** Callback post-sync */
    onSynced?: (event: 'INSERT' | 'UPDATE' | 'DELETE', conversation: direct_conversations) => void;
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
export declare function useDirectConversationsSync({ userId, role, queryKey, queryClient, enabled, onSynced, }: UseDirectConversationsSyncOptions): void;
export interface UseDirectMessagesSyncOptions {
    /** Conversation ID */
    conversationId: string | null;
    /** Query key React Query */
    queryKey: readonly unknown[];
    /** QueryClient */
    queryClient: ReturnType<typeof useQueryClient>;
    /** Abilita/disabilita */
    enabled?: boolean;
    /** Callback post-sync */
    onSynced?: (event: 'INSERT' | 'UPDATE' | 'DELETE', message: direct_messages) => void;
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
export declare function useDirectMessagesSync({ conversationId, queryKey, queryClient, enabled, onSynced, }: UseDirectMessagesSyncOptions): void;
//# sourceMappingURL=direct-messaging.hooks.d.ts.map
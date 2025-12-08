/**
 * useUnifiedChat Hook
 *
 * Hook unificato per Chat e Copilot che combina:
 * - useChatCore per logica AI
 * - Screen context automatico
 * - Feature flags da admin
 * - Conversation management
 * - Model selection
 *
 * PRINCIPI: KISS, SOLID, DRY
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { useChatCore } from './use-chat-core';
import { useUnifiedChatContextSafe } from '../providers/unified-chat-provider';
import type { UseUnifiedChatOptions, UseUnifiedChatResult } from '../types/unified-chat';
import { DEFAULT_CHAT_FEATURES } from '../types/unified-chat';
import type { ChatConversation } from '../types';
import {
  useAIModelsStore,
  selectSelectedModelName,
  selectModels,
  selectSelectedModelId,
} from '@onecoach/lib-stores';

// ============================================================================
// Hook
// ============================================================================

/**
 * useUnifiedChat - Hook unificato per Chat e Copilot
 *
 * Fornisce tutte le funzionalità di Chat in qualsiasi contesto:
 * - Messaggi e input
 * - Conversazioni persistenti
 * - Screen context automatico
 * - Feature flags da admin
 * - Model selection
 *
 * @example
 * ```tsx
 * // In Chat fullscreen
 * const chat = useUnifiedChat({ mode: 'fullscreen' });
 *
 * // In Copilot sidebar
 * const copilot = useUnifiedChat({
 *   mode: 'sidebar',
 *   contextOverride: { type: 'workout', entityId: workoutId }
 * });
 * ```
 */
export function useUnifiedChat(options: UseUnifiedChatOptions = {}): UseUnifiedChatResult {
  const {
    mode = 'sidebar',
    contextOverride,
    conversationId: initialConversationId = null,
    initialConversations = [],
    onContextUpdate,
    reasoningEnabled = false,
    initialModelId,
  } = options;

  // Try to get context from provider (may be null if not in provider)
  const providerContext = useUnifiedChatContextSafe();

  // Local state fallbacks when not in provider
  const [localConversations, setLocalConversations] =
    useState<ChatConversation[]>(initialConversations);
  const [localCurrentConversation, setLocalCurrentConversation] = useState<string | null>(
    initialConversationId
  );
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use Zustand store for AI models (SSOT)
  const storeModels = useAIModelsStore(selectModels);
  const selectedModelId = useAIModelsStore(selectSelectedModelId);
  const selectedModelName = useAIModelsStore(selectSelectedModelName);
  const { selectModel: storeSelectModel, setModels: storeSetModels } = useAIModelsStore();

  // Initialize store with models from provider if available
  useEffect(() => {
    if (providerContext?.models && providerContext.models.length > 0) {
      storeSetModels(providerContext.models);
    }
    if (initialModelId && !selectedModelId) {
      storeSelectModel(initialModelId);
    }
  }, [providerContext?.models, initialModelId, selectedModelId, storeSetModels, storeSelectModel]);

  // Determine effective values (provider or local)
  const screenContext = contextOverride || providerContext?.screenContext || null;
  const features = providerContext?.features || DEFAULT_CHAT_FEATURES;
  const models = storeModels.length > 0 ? storeModels : (providerContext?.models || []);
  const selectedModel = selectedModelId || models[0]?.id || null;
  const userRole = providerContext?.userRole || 'USER';
  const userCredits = providerContext?.userCredits || 0;
  const userId = providerContext?.userId || null;
  const isOpen = providerContext?.isOpen ?? localIsOpen;

  // Conversations state
  const conversations = localConversations;
  const currentConversation = localCurrentConversation;

  // Build request body with screen context
  // Uses Zustand store selector for modelName (already converted from database ID)
  const requestBody = useMemo(() => {
    const body: Record<string, unknown> = {
      tier: 'balanced',
      enableTools: true,
      reasoning: reasoningEnabled,
    };

    // Use selectedModelName from Zustand store (already the API model name)
    if (selectedModelName) {
      body.model = selectedModelName;
      console.warn(`🎯 [useUnifiedChat] Sending model from store: ${selectedModelName}`);
    }

    // Add screen context
    if (screenContext) {
      body.domain = screenContext.type;
      body.context = {
        type: screenContext.type,
        entityId: screenContext.entityId,
        entityType: screenContext.entityType,
        ...screenContext.data,
      };
    }

    return body;
  }, [selectedModelName, screenContext, reasoningEnabled]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/copilot/conversations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setLocalConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [userId]);

  // Use chat core with unified body
  const {
    messages,
    input,
    setInput: setCoreInput,
    sendMessage: coreSendMessage,
    setMessages: setCoreMessages,
    status,
    isLoading,
    error,
    stop,
    reload: coreReload,
    reset: resetCore,
  } = useChatCore({
    api: '/api/chat',
    conversationId: currentConversation,
    body: requestBody,
    onConversationCreated: (newConvId) => {
      setLocalCurrentConversation(newConvId);
    },
    onFinish: () => {
      fetchConversations();
      if (screenContext?.type === 'oneagenda' && onContextUpdate) {
        setTimeout(() => onContextUpdate({}), 500);
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // Initialize conversations on mount
  useEffect(() => {
    if (userId && mode === 'fullscreen') {
      fetchConversations();
    }
  }, [userId, mode, fetchConversations]);

  // Actions
  const setInput = useCallback(
    (value: string) => {
      setCoreInput(value);
    },
    [setCoreInput]
  );

  const setSelectedModel = useCallback(
    (modelId: string) => {
      // Use Zustand store as SSOT for model selection
      storeSelectModel(modelId);
      // Also update provider if available for backward compatibility
      if (providerContext) {
        providerContext.setSelectedModel(modelId);
      }
    },
    [storeSelectModel, providerContext]
  );

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (providerContext) {
        providerContext.setIsOpen(open);
      } else {
        setLocalIsOpen(open);
      }
    },
    [providerContext]
  );

  const toggleOpen = useCallback(() => {
    if (providerContext) {
      providerContext.toggleOpen();
    } else {
      setLocalIsOpen((prev) => !prev);
    }
  }, [providerContext]);

  const sendMessage = useCallback(
    async (options?: { text?: string }) => {
      const messageText = options?.text?.trim() || input.trim();
      if (!messageText || isLoading) return;

      setInput('');

      try {
        await coreSendMessage({ text: messageText });
      } catch (err) {
        console.error('Error sending message:', err);
        setInput(messageText);
      }
    },
    [input, isLoading, coreSendMessage, setInput]
  );

  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(`/api/copilot/conversations/${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          // Ricostruisce UIMessage con parts complete (include tool-call/tool-result/reasoning)
          const loadedMessages: UIMessage[] = (data.messages || []).map(
            (msg: Record<string, unknown>) => {
              // Se il messaggio ha già parts salvate, usale direttamente
              if (msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0) {
                return {
                  id: msg.id as string,
                  role: (msg.role as string).toLowerCase() as 'user' | 'assistant' | 'system',
                  parts: msg.parts as UIMessage['parts'],
                };
              }
              // Fallback: crea parts da content testuale
              return {
                id: msg.id as string,
                role: (msg.role as string).toLowerCase() as 'user' | 'assistant' | 'system',
                parts: [{ type: 'text' as const, text: msg.content as string }],
              };
            }
          );
          setCoreMessages(loadedMessages);
          setLocalCurrentConversation(conversationId);
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
      }
    },
    [setCoreMessages]
  );

  const startNewConversation = useCallback(() => {
    setLocalCurrentConversation(null);
    resetCore();
    setInput('');
  }, [resetCore, setInput]);

  const deleteConversation = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/copilot/conversations/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setLocalConversations((prev) => prev.filter((c: any) => c.id !== id));
          if (currentConversation === id) {
            setLocalCurrentConversation(null);
            resetCore();
          }
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
      } finally {
        setIsDeleting(false);
      }
    },
    [currentConversation, resetCore]
  );

  const deleteConversations = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      setIsDeleting(true);
      try {
        const response = await fetch('/api/copilot/conversations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        if (response.ok) {
          setLocalConversations((prev) => prev.filter((c: any) => !ids.includes(c.id)));
          if (currentConversation && ids.includes(currentConversation)) {
            setLocalCurrentConversation(null);
            resetCore();
          }
        }
      } catch (err) {
        console.error('Error deleting conversations:', err);
      } finally {
        setIsDeleting(false);
      }
    },
    [currentConversation, resetCore]
  );

  const deleteAllConversations = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/copilot/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (response.ok) {
        setLocalConversations([]);
        setLocalCurrentConversation(null);
        resetCore();
      }
    } catch (err) {
      console.error('Error deleting all conversations:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [resetCore]);

  const reload = useCallback(async () => {
    await coreReload();
  }, [coreReload]);

  return {
    // Chat state
    messages,
    input,
    status,
    isLoading,
    error,

    // Conversation state
    conversations,
    currentConversation,
    isDeleting,

    // Context state
    screenContext,
    features,
    models,
    selectedModel,
    userRole,
    userCredits,

    // UI state
    isOpen,

    // Actions
    sendMessage,
    setInput,
    setSelectedModel,
    loadConversation,
    startNewConversation,
    deleteConversation,
    deleteConversations,
    deleteAllConversations,
    reload,
    stop,
    setIsOpen,
    toggleOpen,
  };
}

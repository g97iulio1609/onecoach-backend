/**
 * useChatCore Hook
 *
 * Hook principale per la gestione della chat con AI SDK v6.
 * SSOT per Chat e Copilot, usa useChat nativo + DefaultChatTransport.
 *
 * PRINCIPI:
 * - KISS: Niente wrapper, usa AI SDK direttamente
 * - SOLID: Single Responsibility - solo logica chat AI
 * - DRY: Logica comune per Chat e Copilot
 *
 * USAGE:
 * ```tsx
 * const { messages, sendMessage, input, setInput } = useChatCore({
 *   body: { domain: 'nutrition' },
 * });
 *
 * // Render messages
 * messages.map(msg =>
 *   msg.parts.map(part =>
 *     part.type === 'text' ? <p>{part.text}</p> : null
 *   )
 * )
 *
 * // Send message
 * <form onSubmit={e => { e.preventDefault(); sendMessage({ text: input }); setInput(''); }}>
 * ```
 */

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useChat as useAIChat } from '@ai-sdk/react';
import type { ChatStatus, UseChatCoreOptions, UseChatCoreResult, UIMessage } from '../types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_API = '/api/chat';

// ============================================================================
// Logging
// ============================================================================

// Logging disabled for performance - enable only for debugging
// const DEBUG = process.env.NODE_ENV === 'development';

function log(_message: string, _data?: unknown) {
  // Disabled for streaming performance
}

function logError(message: string, error?: unknown) {
  console.error(`🔴 [useChatCore] ${message}`, error);
}

// ============================================================================
// Status Mapping
// ============================================================================

function mapAISdkStatus(aiStatus: 'submitted' | 'streaming' | 'ready' | 'error'): ChatStatus {
  return aiStatus;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook principale per la gestione della chat.
 * Usa AI SDK v6 useChat con DefaultChatTransport.
 */
export function useChatCore(options: UseChatCoreOptions = {}): UseChatCoreResult {
  const {
    api = DEFAULT_API,
    conversationId: initialConversationId = null,
    initialMessages = [],
    model,
    systemPrompt,
    body: staticBody = {},
    onMessage,
    onError,
    onConversationCreated,
    onFinish,
    enabled = true,
  } = options;

  // Local state
  const [input, setInputLocal] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);

  // Refs for stable callbacks
  const callbacksRef = useRef({ onMessage, onError, onConversationCreated, onFinish });
  callbacksRef.current = { onMessage, onError, onConversationCreated, onFinish };

  // Track processed messages
  const lastProcessedMessageIdRef = useRef<string | null>(null);

  log('Hook initialized', {
    api,
    conversationId: initialConversationId,
    initialMessagesCount: initialMessages.length,
    hasModel: !!model,
    hasSystemPrompt: !!systemPrompt,
  });

  // Prepare body for useChat - this will be sent with each request
  // Following AI SDK v6 pattern: useChat() without custom transport
  // The body is passed to sendMessage() options
  // FIX: model can come from options.model OR staticBody.model (from useUnifiedChat)
  const effectiveModel = model || (staticBody as { model?: string }).model;

  const requestBody = useMemo(() => {
    return {
      ...staticBody,
      model: effectiveModel, // Use effective model (from options or body)
      systemPrompt,
      conversationId,
    };
  }, [effectiveModel, systemPrompt, staticBody, conversationId]);

  // Convert initialMessages to AI SDK v6 UIMessage format
  // STRUCTURAL FIX: Preserve full parts (tool-call, tool-result, reasoning) when available
  // Following AI SDK v6 pattern: message.parts[] is the source of truth
  // https://ai-sdk.dev/elements/components/message
  const aiInitialMessages = useMemo<UIMessage[]>(() => {
    if (!initialMessages.length) return [];

    return initialMessages.map((m: any) => {
      // KISS: If message already has parts array with content, use it directly
      // This preserves tool-call/tool-result/reasoning parts from loaded conversations
      if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
        return {
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          parts: m.parts, // Preserve original parts (tool invocations, reasoning, etc.)
        };
      }

      // Fallback: Create text part from legacy content string
      return {
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        parts: [{ type: 'text' as const, text: m.content || '' }],
      };
    });
  }, [initialMessages]);

  // Transport configuration with DefaultChatTransport - AI SDK v6 pattern
  // https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#custom-headers-body-and-credentials
  const transport = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DefaultChatTransport } = require('ai');
    return new DefaultChatTransport({
      api,
      credentials: 'include' as RequestCredentials,
      body: requestBody, // Static body merged with each request
    });
  }, [api, requestBody]);

  // AI SDK v6 useChat - requires transport for request configuration
  const chatConfig = useMemo(() => ({
    transport,
    // Only pass id if conversationId exists
    ...(conversationId ? { id: conversationId } : {}),
    // Only pass initialMessages if they exist
    ...(aiInitialMessages.length > 0 ? { initialMessages: aiInitialMessages } : {}),
    // Throttle UI updates for better streaming fluidity
    experimental_throttle: 30, // 30ms = ~33 FPS
  }), [transport, conversationId, aiInitialMessages]);

  const {
    messages: aiMessages,
    setMessages: aiSetMessages,
    sendMessage: aiSendMessage,
    status: aiStatus,
    error: aiError,
    stop: aiStop,
  } = useAIChat(chatConfig);

  // Callbacks ref to avoid re-renders
  useEffect(() => {
    callbacksRef.current.onFinish?.();
  }, [aiMessages.length]);

  useEffect(() => {
    if (aiError) {
      logError('Chat error', aiError);
      callbacksRef.current.onError?.(aiError);
    }
  }, [aiError]);




  // Cast messages (they're compatible)
  const messages = aiMessages as UIMessage[];

  // Log messages changes - solo per nuovi messaggi, non durante streaming
  useEffect(() => {
    log('Messages updated', { count: messages.length });

    // Process new messages for callbacks
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.id !== lastProcessedMessageIdRef.current) {
      lastProcessedMessageIdRef.current = lastMessage.id;
      log('New message processed', { id: lastMessage.id, role: lastMessage.role });
      callbacksRef.current.onMessage?.(lastMessage);
    }
  }, [messages]);

  // Map status
  const status = mapAISdkStatus(aiStatus);
  const isLoading = status === 'submitted' || status === 'streaming';

  // Log status changes
  useEffect(() => {
    log('Status changed', { status, isLoading });
  }, [status, isLoading]);

  // Send message handler
  const sendMessage = useCallback(
    async (sendOptions?: { text?: string }) => {
      const messageText = sendOptions?.text ?? input;

      if (!messageText.trim()) {
        log('Empty message, skipping');
        return;
      }

      if (!enabled) {
        log('Chat disabled, skipping');
        return;
      }

      log('Sending message', { text: messageText.slice(0, 50) });

      // Clear input immediately
      setInputLocal('');

      try {
        // Use AI SDK v6 sendMessage following official pattern
        // Pass body in options (like in AI Elements chatbot example)
        await aiSendMessage(
          { text: messageText },
          {
            body: requestBody,
          }
        );

        log('Message sent successfully');
      } catch (error) {
        logError('Failed to send message', error);
        throw error;
      }
    },
    [input, enabled, aiSendMessage, requestBody]
  );

  // setInput wrapper
  const setInput = useCallback((value: string) => {
    setInputLocal(value);
  }, []);

  // Reset handler
  const reset = useCallback(() => {
    log('Resetting chat');
    aiSetMessages([]);
    setInputLocal('');
    setConversationId(null);
    lastProcessedMessageIdRef.current = null;
  }, [aiSetMessages]);

  // setMessages wrapper
  const setMessagesWrapper = useCallback(
    (newMessages: UIMessage[]) => {
      log('Setting messages', { count: newMessages.length });
      aiSetMessages(newMessages as Parameters<typeof aiSetMessages>[0]);
    },
    [aiSetMessages]
  );

  // Reload handler - re-send last user message
  const reload = useCallback(async () => {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (!lastUserMessage) {
      log('No user message to reload');
      return;
    }

    const textPart = lastUserMessage.parts.find((p: any) => p.type === 'text');
    const text = textPart && 'text' in textPart ? (textPart as { text: string }).text : '';

    if (!text) {
      log('No text content in last user message');
      return;
    }

    log('Reloading last message', { text: text.slice(0, 50) });

    // Remove last assistant message
    const messagesWithoutLastAssistant = messages.filter((m, i) => {
      const isLastAssistant = m.role === 'assistant' && i === messages.length - 1;
      return !isLastAssistant;
    });

    aiSetMessages(messagesWithoutLastAssistant as Parameters<typeof aiSetMessages>[0]);

    // Re-send the message
    await aiSendMessage({ text });
  }, [messages, aiSetMessages, aiSendMessage]);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    setMessages: setMessagesWrapper,
    status,
    isLoading,
    error: aiError || null,
    stop: aiStop,
    reload,
    reset,
    conversationId,
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook pre-configurato per Copilot (floating window).
 */
export function useCopilotChatCore(options: Omit<UseChatCoreOptions, 'api'> = {}) {
  log('useCopilotChatCore initialized');
  return useChatCore({
    ...options,
    api: '/api/chat',
  });
}

/**
 * Hook pre-configurato per Chat principale.
 */
export function useMainChatCore(options: Omit<UseChatCoreOptions, 'api'> = {}) {
  log('useMainChatCore initialized');
  return useChatCore({
    ...options,
    api: '/api/chat',
  });
}

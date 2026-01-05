/**
 * Chat Core Hooks
 *
 * Export centralizzato di tutti gli hooks.
 */

export { useChatCore, useCopilotChatCore, useMainChatCore } from './use-chat-core';

export {
  useChatRealtime,
  useChatConversationsRealtime,
  useChatWithRealtime,
} from './use-chat-realtime';

export { useUnifiedChat } from './use-unified-chat';

export {
  useCopilotRefresh,
  useWorkoutCopilotRefresh,
  useNutritionCopilotRefresh,
  useOneAgendaCopilotRefresh,
  type CopilotDomain,
  type UseCopilotRefreshConfig,
} from './use-copilot-refresh';

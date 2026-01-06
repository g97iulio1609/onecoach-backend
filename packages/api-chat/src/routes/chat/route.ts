/**
 * Chat API Route
 *
 * API route per chat con AI usando streaming con AI SDK 6
 * Integra intent detection e tools per generazione piani
 */

import { NextResponse, z } from '@onecoach/lib-core';
export const dynamic = 'force-dynamic';

const chatStreamRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
    })
  ),
  tier: z.enum(['fast', 'balanced', 'quality']).optional().default('balanced'),
  provider: z.enum(['google', 'anthropic', 'openai', 'xai', 'openrouter']).optional(),
  model: z.string().trim().min(1).max(128).optional(),
  temperature: z.number().min(0).max(2).optional(),
  enableIntentDetection: z.boolean().optional().default(true),
  enableTools: z.boolean().optional().default(true),
  reasoning: z.boolean().optional().default(true),
  reasoningEffort: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .default(AI_REASONING_CONFIG.DEFAULT_REASONING_EFFORT),
});

export async function POST(_req: Request) {
  const userOrError = await requireAuth();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const body = await _req.json();
    const input = chatStreamRequestSchema.parse(body);

    const isAdmin = userOrError.role === 'ADMIN';

    if (!isAdmin && (input.provider || input.model)) {
      return NextResponse.json(
        { error: 'Solo gli amministratori possono selezionare provider e modelli personalizzati.' },
        { status: 403 }
      );
    }

    if (isAdmin && input.provider && !input.model) {
      return NextResponse.json(
        { error: 'Specifica un modello valido per il provider selezionato.' },
        { status: 400 }
      );
    }

    // Validate messages
    if (!input.messages || input.messages.length === 0) {
      return NextResponse.json({ error: 'Almeno un messaggio è richiesto' }, { status: 400 });
    }

    // Ensure last message is from user
    const lastMessage = input.messages[input.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: "L'ultimo messaggio deve essere dall'utente" },
        { status: 400 }
      );
    }

    const override =
      isAdmin && input.provider && input.model
        ? {
            provider: input.provider,
            model: input.model.trim(),
            maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
            creditsPerRequest: 1,
          }
        : undefined;

    // Convert messages to chat agent format (simple string content)
    const chatMessages = input.messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Recupera profilo utente per auto-fill parametri
    let userProfile;
    try {
      const profile = await userProfileService.getSerialized(userOrError.id);
      userProfile = {
        weight: profile.weightKg,
        height: profile.heightCm,
        age: profile.age,
        gender: profile.sex ? profile.sex.toLowerCase() : null,
        activityLevel: profile.activityLevel ? profile.activityLevel.toLowerCase() : null,
      };
    } catch (error: unknown) {
      logger.warn('Error loading user profile for chat:', error);
      // Continua senza profilo se non disponibile
      userProfile = undefined;
    }

    // Usa chat agent con intent detection e tools
    const chatResult = await createChatAgentStream({
      userId: userOrError.id,
      messages: chatMessages,
      tier: input.tier,
      override,
      temperature: input.temperature,
      userProfile,
      enableIntentDetection: input.enableIntentDetection,
      enableTools: input.enableTools,
      reasoning: input.reasoning,
      reasoningEffort: input.reasoningEffort,
    });

    // Aggiungi header con informazioni intent detection
    const headers = new Headers(chatResult.stream.headers);
    if (chatResult.intent) {
      headers.set('x-chat-intent', chatResult.intent.type);
      headers.set('x-chat-confidence', String(chatResult.intent.confidence));
      headers.set('x-chat-requires-more-info', String(chatResult.requiresMoreInfo));
    }

    return new Response(chatResult.stream.body, {
      status: chatResult.stream.status,
      statusText: chatResult.stream.statusText,
      headers,
    });
  } catch (error: unknown) {
    logError('Errore nello streaming della chat', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

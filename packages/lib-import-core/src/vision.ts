import { streamText, Output, type CoreMessage } from 'ai';
import { createModel } from '@onecoach/lib-ai-utils/model-factory';
import type { VisionParseParams } from './types';

// Configurazione centralizzata per import AI
const AI_IMPORT_CONFIG = {
  TIMEOUT_MS: 600000, // 10 minuti
  MAX_OUTPUT_TOKENS: 65000,
};

function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export async function parseWithVisionAI<T>(params: VisionParseParams<T>): Promise<T> {
  const { contentBase64, mimeType, prompt, schema, modelId, apiKey } = params;

  const modelConfig = {
    provider: 'openrouter' as const,
    model: modelId ?? 'google/gemini-1.5-flash-002',
    maxTokens: AI_IMPORT_CONFIG.MAX_OUTPUT_TOKENS,
    temperature: 0, // Ignorato dai modelli reasoning ma richiesto dal tipo
    reasoningEnabled: true,
    creditsPerRequest: 0,
  };

  const model = createModel(modelConfig, apiKey ?? process.env.OPENROUTER_API_KEY);
  const dataUrl = base64ToDataUrl(contentBase64, mimeType);

  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image', image: dataUrl },
      ],
    },
  ];

  // Usa streamText con Output.object() per output strutturato con validazione Zod
  const streamResult = streamText({
    model,
    output: Output.object({ schema }),
    messages,
    abortSignal: AbortSignal.timeout(AI_IMPORT_CONFIG.TIMEOUT_MS),
    // No temperature per modelli reasoning
  });

  // Attendi l'oggetto completo validato
  const validated = await streamResult.output;

  if (!validated) {
    throw new Error('AI returned empty response');
  }

  return validated;
}

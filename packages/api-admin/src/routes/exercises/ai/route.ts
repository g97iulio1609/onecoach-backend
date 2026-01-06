
import { executeAiPlan } from '@onecoach/lib-ai-agents';
import { createGenerationHandler } from '@onecoach/lib-api/utils/generation-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const aiRequestSchema = z.object({
  prompt: z.string().trim().min(10, 'Fornire un prompt dettagliato (minimo 10 caratteri)'),
  autoApprove: z.boolean().default(false),
  mergeExisting: z.boolean().default(false),
});

/**
 * POST /api/admin/exercises/ai
 *
 * Generate exercises with non-streaming response
 */
export const POST = createGenerationHandler({
  requestSchema: aiRequestSchema,
  executeGeneration: async ({ input }) => {
    return await executeAiPlan({
      prompt: input.prompt,
      autoApprove: input.autoApprove,
      mergeExisting: input.mergeExisting,
    });
  },
  errorMessage: "Errore durante l'esecuzione del piano AI",
});

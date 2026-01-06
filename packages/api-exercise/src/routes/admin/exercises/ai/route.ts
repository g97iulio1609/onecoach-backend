import { ExerciseAdminService } from '@onecoach/lib-exercise-admin.service';
import { createGenerationHandler } from '@onecoach/lib-api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const aiRequestSchema = z.object({
  prompt: z.string().trim().min(10, 'Fornire un prompt dettagliato (minimo 10 caratteri)'),
  autoApprove: z.boolean().optional(),
  mergeExisting: z.boolean().optional(),
});

/**
 * POST /api/admin/exercises/ai
 *
 * Generate exercises with non-streaming response
 */
export const POST = createGenerationHandler({
  requestSchema: aiRequestSchema,
  executeGeneration: async ({ input, userId }) => {
    return await ExerciseAdminService.executeAiPlan({
      prompt: input.prompt,
      userId,
      autoApprove: input.autoApprove,
      mergeExisting: input.mergeExisting,
    });
  },
  errorMessage: "Errore durante l'esecuzione del piano AI",
});

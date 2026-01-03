import { FoodAdminService } from '@onecoach/lib-food';
import { createGenerationHandler } from '@onecoach/lib-api/utils/generation-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const aiRequestSchema = z.object({
  prompt: z.string().trim().min(10, 'Fornire un prompt dettagliato (minimo 10 caratteri)'),
  mergeExisting: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/foods/ai
 *
 * Generate foods with non-streaming response
 */
export const POST = createGenerationHandler({
  requestSchema: aiRequestSchema,
  executeGeneration: async ({ input, userId }) => {
    // Parse prompt to extract count (default 5)
    const prompt = input.prompt;
    const countMatch = prompt.match(/(\d+)\s*(nuovi\s*)?(alimenti|foods?)/i);
    const count = countMatch && countMatch[1] ? parseInt(countMatch[1], 10) : 5;

    const result = await FoodAdminService.generateFoodsWithAgent({
      count,
      description: prompt,
      userId,
      mergeExisting: input.mergeExisting,
    });

    // Return directly - createGenerationHandler will wrap it
    return {
      summary: `Generati ${result.created} alimenti, ${result.updated} aggiornati, ${result.skipped} saltati`,
      createResult: result,
    };
  },
  errorMessage: 'Errore durante la generazione alimenti con AI',
});

/**
 * Food AI Generation Streaming API Route
 *
 * Handles streaming food generation using FoodGenerationAgent.
 * Provides real-time progress updates via Server-Sent Events (SSE).
 */

import { AgentRole } from '@onecoach/one-agent';
import { FoodAdminService } from '@onecoach/lib-food';
import { createStreamingHandler } from '@onecoach/lib-api/utils/streaming-handler';

interface FoodStreamInput {
  prompt: string;
  mergeExisting?: boolean;
}

/**
 * POST /api/admin/foods/ai/stream
 *
 * Generate foods with streaming SSE response
 */
export const POST = createStreamingHandler<
  FoodStreamInput,
  Awaited<ReturnType<typeof FoodAdminService.generateFoodsWithAgent>>
>({
  agentRole: AgentRole.FOOD_GENERATION,
  initialDescription: 'Starting food generation...',
  validateRequest: (body) => {
    const { prompt, mergeExisting = false } = body as FoodStreamInput;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt is required' };
    }

    return { valid: true, data: { prompt, mergeExisting } };
  },
  executeGeneration: async ({ input, userId, sendEvent }) => {
    // Parse prompt to extract generation parameters
    const lowerPrompt = input.prompt.toLowerCase();
    const categoryIds: string[] = [];
    let count = 5; // Default count

    // Extract count from prompt (e.g., "5 nuovi alimenti")
    const countMatch = input.prompt.match(/(\d+)\s*(nuovi\s*)?(alimenti|foods?)/i);
    if (countMatch && countMatch[1]) {
      count = parseInt(countMatch[1], 10);
    }

    // Extract category keywords from prompt (optional)
    const categoryKeywords: Record<string, string[]> = {
      protein: ['proteine', 'protein', 'carne', 'meat', 'pesce', 'fish'],
      carbs: ['carboidrati', 'carbs', 'pasta', 'riso', 'rice', 'cereali'],
      fats: ['grassi', 'fats', 'oli', 'oils', 'noci', 'nuts'],
      vegetables: ['verdure', 'vegetables', 'insalata', 'salad'],
      fruits: ['frutta', 'fruits', 'frutti'],
      dairy: ['latticini', 'dairy', 'latte', 'milk', 'formaggio', 'cheese'],
    };

    // Fetch food categories from database
    const { prisma } = await import('@onecoach/lib-core/prisma');
    const allCategories = await prisma.food_categories.findMany({
      select: { id: true, name: true, slug: true },
    });

    // Match category keywords to actual category IDs
    for (const [categoryType, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerPrompt.includes(kw))) {
        const matchingCategory = allCategories.find(
          (c: unknown) =>
            c.name.toLowerCase().includes(categoryType) ||
            c.slug.toLowerCase().includes(categoryType)
        );
        if (matchingCategory) {
          categoryIds.push(matchingCategory.id);
        }
      }
    }

    sendEvent({
      type: 'agent_progress',
      data: {
        progress: 10,
        message: `Preparando generazione di ${count} alimenti...`,
      },
    });

    // Fetch existing foods for duplicate prevention
    sendEvent({
      type: 'agent_progress',
      data: {
        progress: 20,
        message: 'Recuperando alimenti esistenti per prevenire duplicati...',
      },
    });

    const existingFoods = await prisma.food_items.findMany({
      select: { name: true },
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    sendEvent({
      type: 'agent_progress',
      data: {
        progress: 30,
        message: `Recuperati ${existingFoods.length} alimenti esistenti${categoryIds.length > 0 ? `, ${categoryIds.length} categorie selezionate` : ''}`,
      },
    });

    // Generate foods using the agent
    sendEvent({
      type: 'agent_progress',
      data: {
        progress: 40,
        message: `Generando ${count} alimenti con AI...`,
      },
    });

    const result = await FoodAdminService.generateFoodsWithAgent({
      count,
      description: input.prompt,
      existingFoods: existingFoods.map((f: unknown) => f.name),
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      userId,
      mergeExisting: input.mergeExisting,
      onProgress: (progress, message) => {
        sendEvent({
          type: 'agent_progress',
          data: {
            progress,
            message,
          },
        });
      },
    });

    // Progress updates are now handled by the service via onProgress callback
    return result;
  },
  buildOutput: (result) => ({
    summary: `Generati ${result.created} alimenti, ${result.updated} aggiornati, ${result.skipped} saltati`,
    createResult: {
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      createdItems: result.createdItems,
      updatedItems: result.updatedItems,
      skippedNames: result.skippedNames,
      errors: result.errors,
    },
  }),
});

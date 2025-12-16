/**
 * Food Vision Service
 *
 * Servizio per analisi immagini con OpenRouter + Gemini
 * Supporta estrazione etichette e segmentazione piatti
 */

import { streamText, Output, type CoreMessage } from 'ai';
import { z } from 'zod';
import { AIProviderConfigService, PROVIDER_MAP } from '@onecoach/lib-ai/ai-provider-config';
import { creditService } from '@onecoach/lib-core/credit.service';
import { prisma } from '@onecoach/lib-core/prisma';
import type { LabelExtractionResult, DishSegmentationResult } from '@onecoach/types';

import { TOKEN_LIMITS } from '@onecoach/constants/models';

// Configurazione AI centralizzata per import
const AI_IMPORT_CONFIG = {
  TIMEOUT_MS: 600000, // 10 minuti
};

// Default models configurabili admin
const DEFAULT_LABEL_MODEL = 'google/gemini-2.5-flash-lite';
const DEFAULT_SEGMENTATION_MODEL = 'google/gemini-2.5-flash';

/**
 * Schema Zod per estrazione etichetta
 */
const labelExtractionSchema = z.object({
  name: z.string(),
  macrosPer100g: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
  }),
  servingSize: z.number().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema Zod per segmentazione piatto
 */
const dishSegmentationSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      confidence: z.number().min(0).max(1),
    })
  ),
  totalMacros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
  }),
});

/**
 * Converte base64 in formato data URL
 */
function base64ToDataUrl(base64: string, mimeType: string = 'image/jpeg'): string {
  // Rimuovi prefix se presente
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  return `data:${mimeType};base64,${cleanBase64}`;
}

/**
 * Carica configurazione modello Vision da admin config
 */
async function getVisionModelConfig(
  type: 'label' | 'segmentation'
): Promise<{ provider: 'openrouter'; model: string; apiKey: string }> {
  const apiKey = await AIProviderConfigService.getApiKey('openrouter');
  const openRouterConfig = await AIProviderConfigService.getConfig('openrouter');

  if (!apiKey) {
    throw new Error('OpenRouter API key non configurata');
  }

  // Carica configurazione vision models dal metadata o usa defaults
  const metadata = (openRouterConfig?.metadata as Record<string, unknown>) || {};
  const visionModels = (metadata.visionModels as Record<string, string>) || {};

  let model: string;
  if (type === 'label') {
    model = visionModels.labelExtraction || DEFAULT_LABEL_MODEL;
  } else {
    model = visionModels.dishSegmentation || DEFAULT_SEGMENTATION_MODEL;
  }

  return {
    provider: 'openrouter',
    model,
    apiKey,
  };
}

/**
 * Salva configurazione modelli Vision nel metadata OpenRouter
 */
export async function updateVisionModelConfig(
  labelModel?: string,
  segmentationModel?: string
): Promise<void> {
  const openRouterConfig = await AIProviderConfigService.getConfig('openrouter');

  if (!openRouterConfig) {
    throw new Error('OpenRouter config non trovata');
  }

  const metadata = (openRouterConfig.metadata as Record<string, unknown>) || {};
  const visionModels = (metadata.visionModels as Record<string, string>) || {};

  if (labelModel) {
    visionModels.labelExtraction = labelModel;
  }

  if (segmentationModel) {
    visionModels.dishSegmentation = segmentationModel;
  }

  // Aggiorna metadata con visionModels usando update diretto
  const openrouterProvider = PROVIDER_MAP.openrouter;
  if (!openrouterProvider) {
    throw new Error('OpenRouter provider not configured');
  }
  await prisma.ai_provider_configs.update({
    where: { provider: openrouterProvider.enum },
    data: {
      metadata: {
        ...metadata,
        visionModels,
      },
      updatedBy: 'system',
      updatedAt: new Date(),
    },
  });
}

export class FoodVisionService {
  /**
   * Estrae dati nutrizionali da etichetta alimentare
   */
  static async extractLabelData(
    imageBase64: string,
    userId: string
  ): Promise<LabelExtractionResult> {
    const config = await getVisionModelConfig('label');
    const creditCost = 5; // Costo per operazione vision

    // Valida crediti
    const hasEnoughCredits = await creditService.checkCredits(userId, creditCost);
    if (!hasEnoughCredits) {
      throw new Error('Crediti insufficienti per analisi etichetta');
    }

    // Consuma crediti
    await creditService.consumeCredits({
      userId,
      amount: creditCost,
      type: 'CONSUMPTION',
      description: 'Estrazione dati etichetta alimentare',
      metadata: {
        operation: 'food_label_extraction',
        provider: config.provider,
        model: config.model,
      },
    });

    try {
      // Crea modello OpenRouter usando ProviderFactory
      const { createModel } = await import('@onecoach/lib-ai-utils/model-factory');
      const modelConfig = {
        provider: 'openrouter' as const,
        model: config.model,
        maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
        temperature: 0, // Ignorato da modelli reasoning
        reasoningEnabled: true,
        creditsPerRequest: creditCost,
      };
      const model = createModel(modelConfig, config.apiKey);

      // Converti immagine in data URL se necessario
      const imageDataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : base64ToDataUrl(imageBase64);

      // Chiama AI con immagine usando streamText con Output.object() (AI SDK 6)
      const messages: CoreMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analizza questa etichetta alimentare ed estrai tutti i dati nutrizionali visibili.',
            },
            {
              type: 'image',
              image: imageDataUrl,
            },
          ],
        },
      ];

      const streamResult = streamText({
        model,
        output: Output.object({ schema: labelExtractionSchema }),
        messages,
        abortSignal: AbortSignal.timeout(AI_IMPORT_CONFIG.TIMEOUT_MS),
      });

      // Attendi oggetto completo validato
      const validated = await streamResult.output;
      if (!validated) {
        throw new Error('Failed to generate structured output');
      }

      return validated as LabelExtractionResult;
    } catch (error: unknown) {
      console.error('Error extracting label data:', error);
      // Rimborsa crediti in caso di errore
      await creditService.addCredits({
        userId,
        amount: creditCost,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Rimborso analisi etichetta fallita',
      });
      throw new Error(
        `Errore nell'estrazione dati: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      );
    }
  }

  /**
   * Segmenta piatto identificando componenti e quantità
   */
  static async segmentDish(imageBase64: string, userId: string): Promise<DishSegmentationResult> {
    const config = await getVisionModelConfig('segmentation');
    const creditCost = 8; // Costo più alto per segmentazione (più complessa)

    // Valida crediti
    const hasEnoughCredits = await creditService.checkCredits(userId, creditCost);
    if (!hasEnoughCredits) {
      throw new Error('Crediti insufficienti per segmentazione piatto');
    }

    // Consuma crediti
    await creditService.consumeCredits({
      userId,
      amount: creditCost,
      type: 'CONSUMPTION',
      description: 'Segmentazione piatto con identificazione componenti',
      metadata: {
        operation: 'food_dish_segmentation',
        provider: config.provider,
        model: config.model,
      },
    });

    try {
      // Crea modello OpenRouter usando ProviderFactory
      const { createModel } = await import('@onecoach/lib-ai-utils/model-factory');
      const modelConfig = {
        provider: 'openrouter' as const,
        model: config.model,
        maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
        temperature: 0, // Ignorato da modelli reasoning
        reasoningEnabled: true,
        creditsPerRequest: creditCost,
      };
      const model = createModel(modelConfig, config.apiKey);

      // Converti immagine in data URL se necessario
      const imageDataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : base64ToDataUrl(imageBase64);

      // Chiama AI con immagine usando streamText con Output.object() (AI SDK 6)
      const messages: CoreMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analizza questa foto di piatto e identifica tutti gli alimenti visibili con le relative quantità stimate in grammi.',
            },
            {
              type: 'image',
              image: imageDataUrl,
            },
          ],
        },
      ];

      const streamResult = streamText({
        model,
        output: Output.object({ schema: dishSegmentationSchema }),
        messages,
        abortSignal: AbortSignal.timeout(AI_IMPORT_CONFIG.TIMEOUT_MS),
      });

      // Attendi oggetto completo validato
      const segmentationResult = await streamResult.output;
      if (!segmentationResult) {
        throw new Error('Failed to generate structured output');
      }

      // Filtra item con confidence < 0.5
      const filteredItems = segmentationResult.items.filter(
        (item) => (item as { confidence?: number }).confidence ?? 0 >= 0.5
      );

      return {
        items: filteredItems,
        totalMacros: segmentationResult.totalMacros,
      };
    } catch (error: unknown) {
      console.error('Error segmenting dish:', error);
      // Rimborsa crediti in caso di errore
      await creditService.addCredits({
        userId,
        amount: creditCost,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Rimborso segmentazione fallita',
      });
      throw new Error(
        `Errore nella segmentazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      );
    }
  }
}

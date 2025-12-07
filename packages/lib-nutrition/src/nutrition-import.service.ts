import { z } from 'zod';
import { prisma } from '@OneCoach/lib-core/prisma';
import { logger } from '@OneCoach/lib-shared/utils/logger';
import type {
  AIParseContext,
  ImportFile,
  ImportOptions,
  ImportProgress,
} from '@OneCoach/lib-import-core';
import { IMPORT_LIMITS, createMimeRouter, parseWithVisionAI } from '@OneCoach/lib-import-core';
import { normalizeAgentPayload, preparePlanForPersistence } from './helpers/plan-transform';
import type { nutrition_plans } from '@prisma/client';
import {
  toPrismaJsonAdaptations,
  toPrismaJsonCompleteMacros,
  toPrismaJsonMetadata,
  toPrismaJsonPersonalizedPlan,
  toPrismaJsonUserProfile,
  toPrismaJsonWeeks,
} from './helpers/prisma-helpers';
import type { ImportedNutritionPlan } from './helpers/imported-nutrition.schema';
import { ImportedNutritionPlanSchema } from './helpers/imported-nutrition.schema';

const NutritionImportOptionsSchema = z.object({
  mode: z.enum(['auto', 'review']).default('auto'),
  locale: z.string().optional(),
});

export type NutritionImportOptions = z.infer<typeof NutritionImportOptionsSchema>;

export type NutritionImportResult = {
  success: boolean;
  planId?: string;
  plan?: nutrition_plans;
  parseResult?: ImportedNutritionPlan;
  warnings?: string[];
  errors?: string[];
};

export class NutritionImportService {
  constructor(
    private readonly params: {
      aiContext: AIParseContext<ImportedNutritionPlan>;
      onProgress?: (progress: ImportProgress) => void;
      context?: { requestId?: string; userId: string };
    }
  ) { }

  private emit(progress: ImportProgress) {
    if (this.params.onProgress) {
      this.params.onProgress(progress);
    }
  }

  private validateFiles(files: ImportFile[]) {
    if (files.length === 0) throw new Error('Almeno un file richiesto');
    if (files.length > IMPORT_LIMITS.MAX_FILES)
      throw new Error(`Massimo ${IMPORT_LIMITS.MAX_FILES} file`);

    for (const file of files) {
      if (file.size && file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
        throw new Error(
          `File troppo grande: ${file.name} (max ${Math.round(
            IMPORT_LIMITS.MAX_FILE_SIZE / (1024 * 1024)
          )}MB)`
        );
      }
    }
  }

  private buildRouter() {
    const prompt = buildNutritionPrompt();
    const handler = async (content: string, mimeType: string) =>
      this.params.aiContext.parseWithAI(content, mimeType, prompt);

    return createMimeRouter<ImportedNutritionPlan>({
      image: handler,
      pdf: handler,
      spreadsheet: handler,
      document: handler,
      fallback: handler,
    });
  }

  async import(
    files: ImportFile[],
    userId: string,
    options?: Partial<ImportOptions>
  ): Promise<NutritionImportResult> {
    this.emit({ step: 'validating', message: 'Validazione file' });
    this.validateFiles(files);

    NutritionImportOptionsSchema.parse(options ?? {});
    const router = this.buildRouter();

    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      this.emit({ step: 'parsing', message: 'Parsing con AI', progress: 0.25 });
      const firstFile = files[0];
      if (!firstFile) {
        throw new Error('Nessun file valido fornito');
      }
      const parseResult = await router(
        firstFile.content,
        firstFile.mimeType || 'application/octet-stream'
      );
      const normalized = normalizeAgentPayload(parseResult, {
        userId,
        status: 'ACTIVE',
      });

      const persistenceData = preparePlanForPersistence(normalized);

      this.emit({ step: 'persisting', message: 'Salvataggio piano', progress: 0.75 });
      const plan = await prisma.nutrition_plans.create({
        data: {
          id: normalized.id,
          userId,
          name: persistenceData.name,
          description: persistenceData.description,
          goals: persistenceData.goals,
          durationWeeks: persistenceData.durationWeeks,
          targetMacros: toPrismaJsonCompleteMacros(persistenceData.targetMacros),
          userProfile: toPrismaJsonUserProfile(persistenceData.userProfile),
          personalizedPlan: toPrismaJsonPersonalizedPlan(persistenceData.personalizedPlan),
          adaptations: toPrismaJsonAdaptations(persistenceData.adaptations),
          weeks: toPrismaJsonWeeks(persistenceData.weeks),
          restrictions: persistenceData.restrictions,
          preferences: persistenceData.preferences,
          status: persistenceData.status,
          metadata: toPrismaJsonMetadata(persistenceData.metadata),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.emit({ step: 'completed', message: 'Import completato', progress: 1 });

      return {
        success: true,
        planId: plan.id,
        plan,
        parseResult,
        warnings,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore sconosciuto';
      logger.error('Nutrition import failed', {
        userId,
        error: message,
        requestId: this.params.context?.requestId,
      });
      errors.push(message);
      return { success: false, errors };
    }
  }
}

export function createNutritionAIContext(): AIParseContext<ImportedNutritionPlan> {
  return {
    parseWithAI: (content: string, mimeType: string, prompt: string) =>
      parseWithVisionAI<ImportedNutritionPlan>({
        contentBase64: content,
        mimeType,
        prompt,
        schema: ImportedNutritionPlanSchema,
      }),
  };
}

function buildNutritionPrompt(): string {
  return `Analizza il file allegato (piano nutrizionale) e restituisci SOLO JSON che rispetti esattamente lo schema seguente, senza testo extra:
{
  "name": string,
  "description": string,
  "goals": string[],
  "durationWeeks": number,
  "targetMacros": { "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number },
  "weeks": [
    {
      "weekNumber": number,
      "days": [
        {
          "dayNumber": number,
          "dayName": string,
          "meals": [
            {
              "name": string,
              "type": string,
              "time": string,
              "foods": [
                {
                  "foodItemId": string | null,
                  "name": string,
                  "quantity": number,
                  "unit": string,
                  "macros": { "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number }
                }
              ],
              "totalMacros": { "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number }
            }
          ],
          "totalMacros": { "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number }
        }
      ]
    }
  ],
  "restrictions": string[],
  "preferences": string[],
  "status": "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED"
}
Regole:
- Usa valori numerici reali (niente stringhe tipo "20g").
- Calcola calorie con Atwater: 4*carbs + 4*protein + 9*fats.
- Mantieni coerenza: somma dei cibi = macros del pasto; somma pasti = macros giorno.
- Usa solo cibi plausibili; se non trovi un foodItemId lascia name e macros valorizzati.`;
}

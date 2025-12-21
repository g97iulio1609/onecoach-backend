import { z } from 'zod';
import { prisma } from '@onecoach/lib-core/prisma';
import { BaseImportService, parseWithVisionAI, } from '@onecoach/lib-import-core';
import { normalizeAgentPayload, preparePlanForPersistence } from './helpers/plan-transform';
import { toPrismaJsonAdaptations, toPrismaJsonCompleteMacros, toPrismaJsonMetadata, toPrismaJsonPersonalizedPlan, toPrismaJsonUserProfile, toPrismaJsonWeeks, } from './helpers/prisma-helpers';
import { ImportedNutritionPlanSchema } from './helpers/imported-nutrition.schema';
const NutritionImportOptionsSchema = z.object({
    mode: z.enum(['auto', 'review']).default('auto'),
    locale: z.string().optional(),
});
/**
 * Service for importing nutrition plans.
 * Extends BaseImportService to use shared orchestration logic.
 */
export class NutritionImportService extends BaseImportService {
    getLoggerName() {
        return 'NutritionImport';
    }
    buildPrompt(_options) {
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
    async processParsed(parsed, userId, options) {
        NutritionImportOptionsSchema.parse(options ?? {});
        const normalized = normalizeAgentPayload(parsed, {
            userId,
            status: 'ACTIVE',
        });
        const persistenceData = preparePlanForPersistence(normalized);
        // Pass both the parsed data and the persistence data to the persist step
        // The persist step needs userId/id from normalized, and db-ready objects from persistenceData
        return { normalized, persistenceData, parseResult: parsed };
    }
    async persist(processed, userId) {
        const { normalized, persistenceData, parseResult } = processed;
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
        return {
            planId: plan.id,
            plan,
            parseResult,
        };
    }
    createErrorResult(errors) {
        return {
            success: false,
            errors,
        };
    }
}
export function createNutritionAIContext() {
    return {
        parseWithAI: (content, mimeType, prompt) => parseWithVisionAI({
            contentBase64: content,
            mimeType,
            prompt,
            schema: ImportedNutritionPlanSchema,
        }),
    };
}

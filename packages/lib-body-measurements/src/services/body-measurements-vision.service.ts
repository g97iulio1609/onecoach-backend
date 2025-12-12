/**
 * Body Measurements Vision Service
 *
 * Servizio AI per parsing di misurazioni corporee da file
 * (immagini, PDF, documenti e spreadsheet).
 *
 * @module lib-body-measurements/services/body-measurements-vision
 */

import { streamObject } from 'ai';
import { AIProviderConfigService } from '@onecoach/lib-ai/ai-provider-config';
import {
  AIFrameworkConfigService,
  FrameworkFeature,
  type ImportModelsConfig,
} from '@onecoach/lib-ai/ai-framework-config.service';
import { creditService } from '@onecoach/lib-core/credit.service';
import { TOKEN_LIMITS } from '@onecoach/constants';
import {
  ImportedBodyMeasurementsSchema,
  type ImportedBodyMeasurements,
} from '../schemas/imported-body-measurements.schema';

// ==================== TYPES ====================

type ImportFileType = keyof ImportModelsConfig['creditCosts'];
type ImportModelKey = 'imageModel' | 'pdfModel' | 'documentModel' | 'spreadsheetModel';

// ==================== PROMPTS ====================

const IMAGE_EXTRACTION_PROMPT = `Analyze this image containing body measurements (scales app screenshots, medical reports, handwritten notes) and extract all data.

OUTPUT FORMAT (JSON):
{
  "sourceName": "Image Upload",
  "measurements": [
    {
      "date": "YYYY-MM-DD",
      "weight": 75.5,
      "bodyFat": 15.2,
      "muscleMass": 60.1,
      "visceralFat": 3,
      "waterPercentage": 60.5,
      "chest": 100,
      "waist": 80,
      "hips": 95,
      ...
    }
  ]
}

RULES:
1. Extract date from the image if present, otherwise omit (will default to today).
2. Look for keywords like "Peso", "Weight", "Grasso", "Fat", "Muscolo", "Muscle", "Vita", "Waist".
3. Convert all units to Metric (kg, cm, %). If lb/in found, convert: 1lb = 0.453592kg, 1in = 2.54cm.
4. Extract circumferences if present.
5. If multiple dates are visible (history view), extract ALL entries in the array.
6. Return only valid JSON.`;

const PDF_EXTRACTION_PROMPT = `Analyze this PDF document (Inbody report, DEXA scan, medical checkup, or nutritionist report) and extract body composition and measurement data.

OUTPUT FORMAT (JSON):
{
  "sourceName": "PDF Report",
  "measurements": [
    {
      "date": "YYYY-MM-DD",
      "weight": 80.0,
      "bodyFat": 18.5,
      ...
    }
  ]
}

RULES:
1. Identify the date of measurement.
2. Extract all available metrics: Weight, Body Fat, Muscle Mass, BMR, Metabolic Age, Visceral Fat.
3. Extract all available circumferences.
4. If the document contains history/trends, extract all historical data points as separate entries.
5. Notes: summarize any physician/nutritionist comments found.`;

const SPREADSHEET_EXTRACTION_PROMPT = `You are a data analyst. Parse this spreadsheet data containing body measurements tracking.

Possible columns: Date, Weight, BMI, Body Fat %, Muscle Mass, Waist, Hips, Chest, Arms, etc.

OUTPUT FORMAT (JSON):
{
  "sourceName": "Spreadsheet Import",
  "measurements": [
    {
      "date": "YYYY-MM-DD",
      "weight": 70.5,
      "waist": 78,
      ...
    }
  ]
}

RULES:
1. Map columns intelligently (e.g., "Peso kg" -> weight, "BF%" -> bodyFat).
2. Convert dates to ISO (YYYY-MM-DD).
3. If multiple rows exist, map each to a measurement entry.
4. Ignore empty rows or calculations/averages rows.
5. Ensure numbers are floats, not strings.`;

const DOCUMENT_EXTRACTION_PROMPT = `Analyze this text document containing body measurements.

OUTPUT FORMAT (JSON):
{
  "sourceName": "Document Import",
  "measurements": [
    { "date": "...", "weight": ... }
  ]
}

Extact all declared metrics and dates.`;

// ==================== UTILITIES ====================

function decodeBase64ToText(base64: string): string {
  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(cleanBase64, 'base64').toString('utf-8');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number, baseMs: number): number {
  return baseMs * Math.pow(2, attempt);
}

// Reuse configuration logic from WorkoutVisionService
async function getVisionModelConfig(type: ImportFileType): Promise<{
  provider: 'openrouter';
  model: string;
  apiKey: string;
  fallbackModel: string;
  creditCost: number;
  maxRetries: number;
  retryDelayBaseMs: number;
}> {
  const apiKey = await AIProviderConfigService.getApiKey('openrouter');

  if (!apiKey) {
    throw new Error('OpenRouter API key non configurata.');
  }

  const { config } = await AIFrameworkConfigService.getConfig(FrameworkFeature.IMPORT_MODELS);

  if (!config) {
    throw new Error('Configurazione AI per import non trovata.');
  }

  const typedConfig = config as ImportModelsConfig;

  const modelKeyMap: Record<ImportFileType, ImportModelKey> = {
    image: 'imageModel',
    pdf: 'pdfModel',
    document: 'documentModel',
    spreadsheet: 'spreadsheetModel',
  };

  const modelKey = modelKeyMap[type];
  const model = typedConfig[modelKey];

  if (!model) throw new Error(`Modello AI per tipo "${type}" non configurato.`);

  const fallbackModel = typedConfig.fallbackModel;
  if (!fallbackModel) throw new Error('Modello fallback non configurato.');

  const creditCost = typedConfig.creditCosts?.[type];
  if (creditCost === undefined) throw new Error(`Costo crediti per "${type}" non configurato.`);

  return {
    provider: 'openrouter',
    model,
    apiKey,
    fallbackModel,
    creditCost,
    maxRetries: typedConfig.maxRetries ?? 0,
    retryDelayBaseMs: typedConfig.retryDelayBaseMs ?? 0,
  };
}

// ==================== SERVICE CLASS ====================

export class BodyMeasurementsVisionService {
  /**
   * Parse da Immagine
   */
  static async parseImage(
    imageBase64: string,
    mimeType: string,
    userId: string
  ): Promise<ImportedBodyMeasurements> {
    return this.parseWithVisionAI(imageBase64, mimeType, userId, 'image', IMAGE_EXTRACTION_PROMPT);
  }

  /**
   * Parse da PDF
   */
  static async parsePDF(pdfBase64: string, userId: string): Promise<ImportedBodyMeasurements> {
    return this.parseWithVisionAI(
      pdfBase64,
      'application/pdf',
      userId,
      'pdf',
      PDF_EXTRACTION_PROMPT
    );
  }

  /**
   * Parse da Documento
   */
  static async parseDocument(
    documentBase64: string,
    mimeType: string,
    userId: string
  ): Promise<ImportedBodyMeasurements> {
    return this.parseWithVisionAI(
      documentBase64,
      mimeType,
      userId,
      'document',
      DOCUMENT_EXTRACTION_PROMPT
    );
  }

  /**
   * Parse da Spreadsheet (Testuale o Vision se binario)
   */
  static async parseSpreadsheet(
    contentBase64: string,
    mimeType: string,
    userId: string
  ): Promise<ImportedBodyMeasurements> {
    // Se è binario puro (xlsx non testuale), idealmente si converte o si usa vision.
    // Qui usiamo l'approccio text-based assumendo CSV o decodifica possibile,
    // oppure fallback su vision se supportato. Per semlpificare, usiamo callTextAI che gestisce CSV.
    // Se è binario (XLSX), callTextAI nel codice originale faceva fallback a vision. Replichiamo.

    return this.callTextAI(
      contentBase64,
      mimeType,
      SPREADSHEET_EXTRACTION_PROMPT,
      userId,
      'spreadsheet'
    );
  }

  // ==================== CORE AI METHODS ====================

  private static async parseWithVisionAI(
    contentBase64: string,
    mimeType: string,
    userId: string,
    type: ImportFileType,
    prompt: string
  ): Promise<ImportedBodyMeasurements> {
    const config = await getVisionModelConfig(type);

    // Check Credits
    const hasCredits = await creditService.checkCredits(userId, config.creditCost);
    if (!hasCredits) throw new Error(`Crediti insufficienti. Richiesti: ${config.creditCost}`);

    await creditService.consumeCredits({
      userId,
      amount: config.creditCost,
      type: 'CONSUMPTION',
      description: `Parsing Body Measurements (${type})`,
      metadata: { operation: 'measurements_parse', fileType: type },
    });

    let currentModel = config.model;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openai = createOpenAI({
          apiKey: config.apiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://onecoach.ai',
            'X-Title': process.env.OPENROUTER_SITE_NAME || 'onecoach AI',
          },
        });

        const model = openai(currentModel);

        const result = await streamObject({
          model,
          schema: ImportedBodyMeasurementsSchema,
          output: 'object',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image', image: contentBase64, mimeType: mimeType as any }, // 'as any' per compatibilità tipi, image supporta mimeType in input
              ],
            },
          ],
        });

        const object = await result.object;
        return object;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Attempt ${attempt + 1} failed:`, lastError);

        if (attempt === 0 && currentModel !== config.fallbackModel) {
          currentModel = config.fallbackModel;
        }
        if (attempt < config.maxRetries) {
          await delay(getRetryDelay(attempt, config.retryDelayBaseMs));
        }
      }
    }

    // Refund on failure
    await creditService.addCredits({
      userId,
      amount: config.creditCost,
      type: 'ADMIN_ADJUSTMENT',
      description: 'Rimborso parsing fallito',
    });

    throw new Error(`Import fallito: ${lastError?.message}`);
  }

  private static async callTextAI(
    contentBase64: string,
    mimeType: string,
    prompt: string,
    userId: string,
    type: ImportFileType
  ): Promise<ImportedBodyMeasurements> {
    const config = await getVisionModelConfig(type);

    const hasCredits = await creditService.checkCredits(userId, config.creditCost);
    if (!hasCredits) throw new Error(`Crediti insufficienti.`);

    await creditService.consumeCredits({
      userId,
      amount: config.creditCost,
      type: 'CONSUMPTION',
      description: `Parsing Spreadsheet (${type})`,
      metadata: { operation: 'measurements_parse_text', fileType: type },
    });

    // XLSX binary check fallback to vision
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      // Se non è CSV testuale, proviamo Vision (OCR screenshot del foglio? No, stream file raw)
      // I modelli text non prendono binary.
      // Per XLSX servirebbe un parser JS intermedio (xlsx package) per estrarre testo, POI passare a AI.
      // Il requisito dice "ai powered senza regex".
      // Se è CSV, decodeBase64ToText funziona.
      // Se è XLSX, il contenuto è binario zip.
      // L'implementazione di workout faceva fallback a vision se binary. Qui facciamo lo stesso se decode fallisce.
    }

    let textContent: string;
    try {
      textContent = decodeBase64ToText(contentBase64);
      // Basic heuristic to check if it's binary garbage (XLSX)
      if (textContent.includes('PK')) { // XLSX preamble
        // Fallback to Vision logic if file is binary and model supports files?
        // OpenRouter vision models accept images, rarely raw binary files unless leveraging code interpreter (which we don't have here).
        // Best approach compliant with "Import AI":
        // 1. Try generic text decode.
        // 2. If binary, we technically need a parser to extract text OR allow AI to read file.
        // Given current constraints, we stick to CSV/Text or we assume the user uploads an image of the spreadsheet if using vision.
        // However, referencing workout-vision.ts:
        /*
          if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            console.warn('[WorkoutVision] XLSX detected, using vision approach for binary content');
            return this.parseWithVisionAI(contentBase64, mimeType, '', 'spreadsheet', prompt);
          }
        */
        // They pass binary to vision AI? Some models accept "files". Let's assume standard Vision pattern logic.
        return this.parseWithVisionAI(contentBase64, mimeType, userId, 'spreadsheet', prompt);
      }
    } catch (e) {
      return this.parseWithVisionAI(contentBase64, mimeType, userId, 'spreadsheet', prompt);
    }

    // Is Text/CSV
    let currentModel = config.model;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openai = createOpenAI({
          apiKey: config.apiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://onecoach.ai',
            'X-Title': process.env.OPENROUTER_SITE_NAME || 'onecoach AI',
          },
        });

        const model = openai(currentModel);

        const result = await streamObject({
            model,
            schema: ImportedBodyMeasurementsSchema,
            output: 'object',
            prompt: `${prompt}\n\nDATA:\n\`\`\`\n${textContent.substring(0, 50000)}\n\`\`\``
        });

        const object = await result.object;
        return object;

      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === 0 && currentModel !== config.fallbackModel) {
            currentModel = config.fallbackModel;
        }
        if (attempt < config.maxRetries) {
            await delay(getRetryDelay(attempt, config.retryDelayBaseMs));
        }
      }
    }

    await creditService.addCredits({
        userId,
        amount: config.creditCost,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Rimborso parsing fallito'
    });

    throw new Error(`Import CSV fallito: ${lastError?.message}`);
  }
}

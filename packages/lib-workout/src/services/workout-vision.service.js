/**
 * Workout Vision Service
 *
 * Servizio SOTA per parsing intelligente di programmi di allenamento
 * da immagini, PDF, documenti e spreadsheet usando AI models.
 *
 * Features:
 * - Parsing multi-formato (immagini, PDF, documenti, CSV/XLSX)
 * - Structured output con Zod schema
 * - Gestione crediti automatica
 * - Retry con backoff esponenziale
 * - Rate limiting e fallback modelli
 *
 * @module lib-workout/services/workout-vision
 */
import { streamText, Output } from 'ai';
import { AIProviderConfigService, PROVIDER_MAP } from '@onecoach/lib-ai/ai-provider-config';
import { AIFrameworkConfigService, FrameworkFeature, } from '@onecoach/lib-ai/ai-framework-config.service';
import { creditService } from '@onecoach/lib-core/credit.service';
import { prisma } from '@onecoach/lib-core/prisma';
import { parseJsonResponse } from '@onecoach/lib-ai-agents/utils/json-parser';
import { TOKEN_LIMITS } from '@onecoach/constants';
import { ImportedWorkoutProgramSchema, } from '../schemas/imported-workout.schema';
// ==================== LOGGING ====================
function traceLog(message, context) {
    if (context && Object.keys(context).length > 0) {
        console.warn('[WorkoutVision][trace]', message, context);
    }
    else {
        console.warn('[WorkoutVision][trace]', message);
    }
}
// ==================== PROMPTS ====================
/**
 * Prompt strutturato per estrazione programmi da immagini
 */
const IMAGE_EXTRACTION_PROMPT = `Analyze this image of a workout program and extract all the exercise information visible.

OUTPUT FORMAT (JSON):
{
  "id": "UUID v4 string (generate if not visible)",
  "name": "Program name if visible, otherwise 'Imported Workout'",
  "description": "Any visible description or context",
  "weeks": [
    {
      "weekNumber": 1,
      "name": "Week name if specified",
      "days": [
        {
          "dayNumber": 1,
          "name": "Day name (e.g., 'Day 1', 'Push Day', 'Monday')",
          "type": "training",
          "exercises": [
            {
              "name": "Exercise name as written",
              "sets": 3,
              "reps": 10,
              "rpe": null,
              "rest": 90,
              "tempo": null,
              "notes": "Any additional notes",
              "weight": null
            }
          ]
        }
      ]
    }
  ]
}

EXTRACTION RULES:
1. Extract EVERY exercise visible, even if partially obscured
2. Parse rep ranges as: "8-12" → reps: 10 (middle value)
3. Parse weight notation: "70%" → intensityPercent: 70
4. Rest periods can be in seconds or minutes (convert to seconds)
5. Tempo format: "3-1-2-0" → tempo: "3-1-2-0"
6. If multiple weeks/days visible, organize hierarchically
7. RPE/RIR notation: "RPE 8" → rpe: 8
8. Include field "id" as a UUID v4 string (generate one if not present)

Return ONLY valid JSON, no markdown formatting.`;
/**
 * Prompt per parsing PDF di programmi workout
 */
const PDF_EXTRACTION_PROMPT = `Analyze this PDF document containing a workout program and extract all exercise information.

The PDF may contain:
- Multiple pages with different training days
- Tables with exercises, sets, reps
- Progressive overload patterns
- Training blocks or phases
- Exercise descriptions and technique notes

OUTPUT FORMAT (JSON):
{
  "id": "UUID v4 string (generate if not provided)",
  "name": "Program name from title or header",
  "description": "Program overview if available",
  "weeks": [
    {
      "weekNumber": 1,
      "name": "Week/Block name",
      "days": [
        {
          "dayNumber": 1,
          "name": "Training day name",
          "type": "training",
          "exercises": [
            {
              "name": "Exercise name",
              "sets": 4,
              "reps": 8,
              "rpe": 8,
              "rest": 120,
              "tempo": null,
              "notes": "Technique cues or notes",
              "weight": null,
              "intensityPercent": null
            }
          ]
        }
      ]
    }
  ]
}

EXTRACTION RULES:
1. Preserve exact exercise names for proper matching
2. Parse ALL visible data - sets, reps, weights, rest, tempo
3. Identify training blocks/phases as separate weeks
4. Include notes for technique cues or execution details
5. Look for header information (author, date, program type)
6. Include field "id" as a UUID v4 string (generate one if not present)

Return ONLY valid JSON.`;
/**
 * Prompt per parsing documenti Word/ODT
 */
const DOCUMENT_EXTRACTION_PROMPT = `Analyze this document containing a workout program and extract all structured exercise data.

Documents may have:
- Headers with program info
- Tables or lists of exercises
- Paragraphs describing workouts
- Multiple sections for different days/weeks

OUTPUT FORMAT (JSON):
{
  "id": "UUID v4 string (generate if missing)",
  "name": "Program title",
  "description": "Overview or introduction text",
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "name": "Day title",
          "type": "training",
          "exercises": [
            {
              "name": "Exercise name",
              "sets": 3,
              "reps": 12,
              "rest": 60,
              "notes": "Any technique notes"
            }
          ]
        }
      ]
    }
  ]
}

RULES:
1. Extract every exercise mentioned
2. Infer structure from headings and formatting
3. Parse any notation for sets/reps/weight
4. Include all relevant notes and descriptions
5. Include field "id" as a UUID v4 string (generate one if not present)

Return ONLY valid JSON.`;
/**
 * Prompt per parsing spreadsheet (CSV/XLSX) di programmi workout
 */
const SPREADSHEET_EXTRACTION_PROMPT = `You are an expert strength coach. Parse this spreadsheet data into a structured workout program.

The data may have columns like:
- week, day, day_in_week, date, session_name
- exercise, exercise_name
- set_number, sets
- reps, repetitions
- weight, weight_kg, weight_lbs, load
- rpe, intensity, intensity_pct_1rm
- tempo (e.g., "3-1-1")
- rest, rest_sec, rest_seconds
- notes, comments

OUTPUT FORMAT (JSON):
{
  "id": "UUID v4 string (generate if missing)",
  "name": "Program name (infer from data or use 'Imported Program')",
  "description": "Brief description based on content",
  "durationWeeks": 4,
  "weeks": [
    {
      "weekNumber": 1,
      "name": "Week 1",
      "days": [
        {
          "dayNumber": 1,
          "name": "Day 1 or session_name from data",
          "type": "training",
          "exercises": [
            {
              "name": "Exercise name exactly as in data",
              "sets": 3,
              "reps": 8,
              "weight": 100.0,
              "rpe": 7.5,
              "intensityPercent": 70,
              "tempo": "3-1-1",
              "rest": 180,
              "notes": "Any notes from data",
              "detailedSets": [
                { "reps": 8, "weight": 137.5, "rpe": 7.2 },
                { "reps": 8, "weight": 140.0, "rpe": 7.5 },
                { "reps": 8, "weight": 142.5, "rpe": 7.8 }
              ]
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Group rows by week -> day -> exercise
2. Each unique exercise within a day becomes ONE exercise entry with multiple sets in detailedSets
3. Preserve EXACT exercise names (case-sensitive, including variations like "Bench Press (TnG)")
4. Keep tempo as string format (e.g., "3-1-1")
5. Convert intensity_pct_1rm to intensityPercent (0-100 scale if given as decimal, multiply by 100)
6. Rest should be in seconds
7. Weight in kg (if lbs, already converted)
8. Include detailedSets array when individual set data differs
9. If set_number column exists, use it to group sets for same exercise
10. Infer program name from session_name patterns if available
11. Include field "id" as a UUID v4 string (generate one if not present)

Return ONLY valid JSON, no markdown or explanatory text.`;
// ==================== UTILITIES ====================
/**
 * Converte base64 in formato data URL
 */
function base64ToDataUrl(base64, mimeType) {
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
    return `data:${mimeType};base64,${cleanBase64}`;
}
/**
 * Delay asincrono per retry
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Calcola delay con exponential backoff
 */
function getRetryDelay(attempt, baseMs) {
    return baseMs * Math.pow(2, attempt);
}
/**
 * Carica configurazione modello AI dalla configurazione admin
 * Legge da ai_framework_configs.import_models (alias legacy: workout_import)
 *
 * IMPORTANTE: Tutti i modelli DEVONO essere configurati dall'admin dashboard.
 * Nessun valore hardcoded - se non configurato, l'operazione fallisce.
 */
async function getVisionModelConfig(type) {
    const apiKey = await AIProviderConfigService.getApiKey('openrouter');
    if (!apiKey) {
        throw new Error('OpenRouter API key non configurata. Vai su Admin > AI Settings > Provider API Keys.');
    }
    const { config } = await AIFrameworkConfigService.getConfig(FrameworkFeature.IMPORT_MODELS);
    if (!config) {
        throw new Error('Configurazione AI per import workout non trovata. ' +
            'Vai su Admin > AI Settings > Framework & Agents > Vision & Import Models per configurare i modelli.');
    }
    const typedConfig = config;
    // Mappa tipo -> chiave config
    const modelKeyMap = {
        image: 'imageModel',
        pdf: 'pdfModel',
        document: 'documentModel',
        spreadsheet: 'spreadsheetModel',
    };
    const modelKey = modelKeyMap[type];
    const model = typedConfig[modelKey];
    // Verifica che il modello sia configurato
    if (!model) {
        throw new Error(`Modello AI per tipo "${type}" non configurato. ` +
            'Vai su Admin > AI Settings > Framework & Agents > Vision & Import Models per configurare i modelli.');
    }
    const fallbackModel = typedConfig.fallbackModel;
    // Verifica che il fallback sia configurato
    if (!fallbackModel) {
        throw new Error('Modello fallback non configurato. ' +
            'Vai su Admin > AI Settings > Framework & Agents > Vision & Import Models per configurare i modelli.');
    }
    const creditCost = typedConfig.creditCosts?.[type];
    if (creditCost === undefined || Number.isNaN(Number(creditCost))) {
        throw new Error(`Costo crediti per "${type}" non configurato. ` +
            'Vai su Admin > AI Settings > Framework & Agents > Vision & Import Models per configurare i costi.');
    }
    const maxRetries = Math.max(0, typedConfig.maxRetries ?? 0);
    const retryDelayBaseMs = Math.max(0, typedConfig.retryDelayBaseMs ?? 0);
    console.warn(`[WorkoutVision] ⚙️ Model config loaded for ${type}:`, {
        type,
        model,
        fallbackModel,
        configuredFromDB: true,
        creditCost,
        maxRetries,
        retryDelayBaseMs,
    });
    return {
        provider: 'openrouter',
        model,
        apiKey,
        fallbackModel,
        creditCost,
        maxRetries,
        retryDelayBaseMs,
    };
}
/**
 * Decodifica base64 a testo
 */
function decodeBase64ToText(base64) {
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
    return Buffer.from(cleanBase64, 'base64').toString('utf-8');
}
// ==================== SERVICE CLASS ====================
/**
 * Workout Vision Service
 *
 * Parsing AI di workout programs da file multimediali e spreadsheet
 */
export class WorkoutVisionService {
    /**
     * Parse programma da immagine (JPEG, PNG, WEBP, HEIC)
     */
    static async parseImage(imageBase64, mimeType, userId) {
        return this.parseWithVisionAI(imageBase64, mimeType, userId, 'image', IMAGE_EXTRACTION_PROMPT);
    }
    /**
     * Parse programma da PDF
     */
    static async parsePDF(pdfBase64, userId) {
        return this.parseWithVisionAI(pdfBase64, 'application/pdf', userId, 'pdf', PDF_EXTRACTION_PROMPT);
    }
    /**
     * Parse programma da documento (DOCX, DOC, ODT)
     */
    static async parseDocument(documentBase64, mimeType, userId) {
        return this.parseWithVisionAI(documentBase64, mimeType, userId, 'document', DOCUMENT_EXTRACTION_PROMPT);
    }
    /**
     * Parse programma da spreadsheet (CSV, XLSX)
     * Usa parsing testuale invece di vision
     */
    static async parseSpreadsheet(contentBase64, mimeType, userId) {
        const config = await getVisionModelConfig('spreadsheet');
        const creditCost = config.creditCost;
        const maxRetries = config.maxRetries;
        const retryDelayBaseMs = config.retryDelayBaseMs;
        // Valida crediti
        const hasCredits = await creditService.checkCredits(userId, creditCost);
        if (!hasCredits) {
            throw new Error(`Crediti insufficienti. Richiesti: ${creditCost} crediti`);
        }
        // Consuma crediti
        await creditService.consumeCredits({
            userId,
            amount: creditCost,
            type: 'CONSUMPTION',
            description: `Parsing workout program da spreadsheet`,
            metadata: {
                operation: 'import_models_parse',
                fileType: 'spreadsheet',
                mimeType,
                provider: config.provider,
                model: config.model,
            },
        });
        let lastError = null;
        let currentModel = config.model;
        // Avviso se model == fallbackModel (nessun vero fallback)
        if (config.model === config.fallbackModel) {
            console.warn('[WorkoutVision] ⚠️ WARNING: Model and fallbackModel are the same!', {
                model: config.model,
                suggestion: 'Configure a different fallback model in Admin > AI Settings > Vision & Import Models',
            });
        }
        console.warn(`[WorkoutVision] 🚀 Starting spreadsheet parsing:`, {
            userId,
            mimeType,
            provider: config.provider,
            model: currentModel,
            fallbackModel: config.fallbackModel,
            sameModelAsFallback: config.model === config.fallbackModel,
            creditCost,
        });
        // Retry loop con fallback
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                traceLog('parseSpreadsheet.attempt', {
                    attempt: attempt + 1,
                    model: currentModel,
                    mimeType,
                });
                const result = await this.callTextAI(contentBase64, mimeType, SPREADSHEET_EXTRACTION_PROMPT, currentModel, config.apiKey);
                return result;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[WorkoutVision] Spreadsheet parsing attempt ${attempt + 1} failed:`, lastError.message);
                // Su primo fallimento, prova modello fallback
                if (attempt === 0 && currentModel !== config.fallbackModel) {
                    console.warn(`[WorkoutVision] Switching to fallback model: ${config.fallbackModel}`);
                    currentModel = config.fallbackModel;
                }
                // Aspetta prima di retry
                if (attempt < maxRetries) {
                    await delay(getRetryDelay(attempt, retryDelayBaseMs));
                }
            }
        }
        // Tutti i tentativi falliti - rimborsa crediti
        await creditService.addCredits({
            userId,
            amount: creditCost,
            type: 'ADMIN_ADJUSTMENT',
            description: 'Rimborso parsing workout fallito',
            metadata: {
                reason: lastError?.message || 'Parsing failed',
            },
        });
        // Messaggio di errore migliorato con suggerimento
        const suggestion = config.model === config.fallbackModel
            ? ' Suggerimento: configura un modello diverso in Admin > AI Settings > Vision & Import Models.'
            : '';
        throw new Error(`Impossibile analizzare il file spreadsheet. ${lastError?.message || 'Errore sconosciuto'}${suggestion}`);
    }
    /**
     * Chiamata AI con text model per spreadsheet
     *
     * Pattern identico a workout-generation-orchestrator.service.ts:
     * - Usa createOpenAI direttamente con OpenRouter baseURL
     * - Usa streamText con Output.object() per maggiore affidabilità
     * - Logging dettagliato di cosa viene inviato al modello
     */
    static async callTextAI(contentBase64, mimeType, prompt, modelId, apiKey) {
        // Import createOpenAI per usare pattern identico a workout-generation-orchestrator
        const { createOpenAI } = await import('@ai-sdk/openai');
        // Decodifica il contenuto base64 a testo
        let textContent;
        try {
            textContent = decodeBase64ToText(contentBase64);
        }
        catch (decodeError) {
            console.error('[WorkoutVision] ❌ Base64 decode failed:', decodeError);
            throw new Error('Impossibile decodificare il contenuto del file');
        }
        // Per XLSX, il contenuto binario non può essere decodificato direttamente
        // In questo caso usiamo vision-like approach
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            console.warn('[WorkoutVision] XLSX detected, using vision approach for binary content');
            return this.parseWithVisionAI(contentBase64, mimeType, '', 'spreadsheet', prompt);
        }
        // Costruisci messaggio per AI
        const fullPrompt = `${prompt}

Here is the spreadsheet data to parse:

\`\`\`csv
${textContent}
\`\`\`

Parse this data and return ONLY valid JSON.`;
        // ========== LOGGING DETTAGLIATO ==========
        const csvRows = textContent.split('\n').length;
        const csvPreview = textContent.substring(0, 500);
        const promptPreview = fullPrompt.substring(0, 1000);
        console.warn('[WorkoutVision] 📋 AI Request Details:', {
            modelId,
            mimeType,
            csvRows,
            csvBytes: textContent.length,
            promptBytes: fullPrompt.length,
            csvPreview: csvPreview + (textContent.length > 500 ? '...' : ''),
        });
        console.warn('[WorkoutVision] 📝 Prompt Preview:', promptPreview + (fullPrompt.length > 1000 ? '...' : ''));
        // ==========================================
        const startTime = Date.now();
        try {
            // Crea provider OpenRouter usando pattern identico a workout-generation-config.service.ts
            const openai = createOpenAI({
                apiKey,
                baseURL: 'https://openrouter.ai/api/v1',
                headers: {
                    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://onecoach.ai',
                    'X-Title': process.env.OPENROUTER_SITE_NAME || 'onecoach AI',
                },
            });
            const model = openai(modelId);
            // Alcuni modelli (reasoning models) non supportano temperature
            // Detect based on model name patterns
            const isReasoningModel = modelId.toLowerCase().includes('reasoning') ||
                modelId.toLowerCase().includes('think') ||
                modelId.toLowerCase().includes('reflect');
        console.warn('[WorkoutVision] 🚀 Calling AI with streamObject (structured output)...', {
                modelId,
                maxOutputTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
                temperature: isReasoningModel ? 'N/A (reasoning model)' : 0.2,
                isReasoningModel,
            });
            // Usa streamText con Output.object() come in workout-generation-orchestrator
            // Questo è più affidabile di streamObject per alcuni modelli
            const streamResult = streamText({
                model,
                output: Output.object({
                    schema: ImportedWorkoutProgramSchema,
                }),
                prompt: fullPrompt,
                maxOutputTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
                // Solo passa temperature per modelli non-reasoning
                ...(isReasoningModel ? {} : { temperature: 0.2 }),
                providerOptions: {
                    openrouter: {
                        usage: { include: true },
                    },
                },
            });
            // Raccogli il testo di risposta per debug
            let rawTextOutput = '';
            let chunkCount = 0;
            console.warn('[WorkoutVision] 📡 Streaming response...');
            for await (const part of streamResult.fullStream) {
                chunkCount++;
                if (part.type === 'text-delta') {
                    rawTextOutput += part.text || '';
                }
                // Log progress ogni 50 chunk
                if (chunkCount % 50 === 0) {
                    console.warn(`[WorkoutVision] 📊 Stream progress: ${chunkCount} chunks, ${rawTextOutput.length} bytes`);
                }
            }
            console.warn('[WorkoutVision] ✅ Stream completed:', {
                chunkCount,
                rawTextLength: rawTextOutput.length,
                durationMs: Date.now() - startTime,
                rawTextPreview: rawTextOutput.substring(0, 500) + (rawTextOutput.length > 500 ? '...' : ''),
            });
            // Prova a ottenere l'output strutturato
            let parsedOutput = null;
            try {
                parsedOutput = (await streamResult.output);
                console.warn('[WorkoutVision] ✅ Structured output parsed successfully:', {
                    hasOutput: Boolean(parsedOutput),
                    programName: parsedOutput?.name,
                    weeksCount: parsedOutput?.weeks?.length,
                });
            }
            catch (parseError) {
                console.error('[WorkoutVision] ⚠️ Structured output failed, trying JSON extraction:', parseError);
                // Fallback: estrai JSON dal testo raw
                if (rawTextOutput) {
                    const jsonMatch = rawTextOutput.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            const parsed = JSON.parse(jsonMatch[0]);
                            parsedOutput = ImportedWorkoutProgramSchema.parse(parsed);
                            console.warn('[WorkoutVision] ✅ Fallback JSON extraction successful');
                        }
                        catch (jsonError) {
                            console.error('[WorkoutVision] ❌ Fallback JSON parsing failed:', jsonError);
                        }
                    }
                }
            }
            if (!parsedOutput) {
                console.error('[WorkoutVision] ❌ No valid output obtained');
                throw new Error('AI returned empty or invalid response');
            }
            traceLog('callTextAI.end', {
                model: modelId,
                durationMs: Date.now() - startTime,
                chunkCount,
                rawTextLength: rawTextOutput.length,
                hasOutput: Boolean(parsedOutput),
                mode: 'streamText+Output.object',
            });
            return parsedOutput;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            const errorStack = err instanceof Error ? err.stack : undefined;
            console.error('[WorkoutVision] ❌ AI call failed:', {
                modelId,
                durationMs: Date.now() - startTime,
                error: errorMessage,
                stack: errorStack,
                errorObject: err,
            });
            traceLog('callTextAI.error', {
                model: modelId,
                durationMs: Date.now() - startTime,
                error: errorMessage,
                mode: 'streamText+Output.object',
            });
            throw err instanceof Error ? err : new Error(`AI call failed: ${errorMessage}`);
        }
    }
    /**
     * Core parsing method con vision model (per immagini, PDF, documenti)
     */
    static async parseWithVisionAI(contentBase64, mimeType, userId, type, prompt) {
        const config = await getVisionModelConfig(type);
        const creditCost = config.creditCost;
        const maxRetries = config.maxRetries;
        const retryDelayBaseMs = config.retryDelayBaseMs;
        // Solo consuma crediti se userId è fornito (evita doppio addebito per XLSX)
        if (userId) {
            const hasCredits = await creditService.checkCredits(userId, creditCost);
            if (!hasCredits) {
                throw new Error(`Crediti insufficienti. Richiesti: ${creditCost} crediti`);
            }
            await creditService.consumeCredits({
                userId,
                amount: creditCost,
                type: 'CONSUMPTION',
                description: `Parsing workout program da ${type}`,
                metadata: {
                    operation: 'import_models_parse',
                    fileType: type,
                    provider: config.provider,
                    model: config.model,
                },
            });
        }
        let lastError = null;
        let currentModel = config.model;
        // Retry loop con fallback
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                traceLog('parseWithVisionAI.attempt', {
                    attempt: attempt + 1,
                    model: currentModel,
                    type,
                    mimeType,
                });
                const result = await this.callVisionAI(contentBase64, mimeType, prompt, currentModel, config.apiKey);
                return result;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`[WorkoutVision] Attempt ${attempt + 1} failed:`, lastError.message);
                // Su primo fallimento, prova modello fallback
                if (attempt === 0 && currentModel !== config.fallbackModel) {
                    console.warn(`[WorkoutVision] Switching to fallback model: ${config.fallbackModel}`);
                    currentModel = config.fallbackModel;
                }
                // Aspetta prima di retry
                if (attempt < maxRetries) {
                    await delay(getRetryDelay(attempt, retryDelayBaseMs));
                }
            }
        }
        // Tutti i tentativi falliti - rimborsa crediti solo se userId fornito
        if (userId) {
            await creditService.addCredits({
                userId,
                amount: creditCost,
                type: 'ADMIN_ADJUSTMENT',
                description: 'Rimborso parsing workout fallito',
                metadata: {
                    reason: lastError?.message || 'Parsing failed',
                },
            });
        }
        throw new Error(`Impossibile analizzare il file. ${lastError?.message || 'Errore sconosciuto'}`);
    }
    /**
     * Chiamata AI con vision model
     */
    static async callVisionAI(contentBase64, mimeType, prompt, modelId, apiKey) {
        const { createModel } = await import('@onecoach/lib-ai-agents/utils/model-factory');
        const modelConfig = {
            provider: 'openrouter',
            model: modelId,
            maxTokens: TOKEN_LIMITS.DEFAULT_MAX_TOKENS,
            temperature: 0.3,
            reasoningEnabled: false,
            creditsPerRequest: 0,
        };
        const model = createModel(modelConfig, apiKey, 0.3);
        // Prepara content in formato data URL
        const dataUrl = base64ToDataUrl(contentBase64, mimeType);
        // Costruisci messaggi per AI
        const messages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt,
                    },
                    {
                        type: 'image',
                        image: dataUrl,
                    },
                ],
            },
        ];
        const startTime = Date.now();
        traceLog('callVisionAI.start', {
            model: modelId,
            promptLength: prompt.length,
            mimeType,
        });
        const result = await streamText({
            model,
            messages,
            experimental_output: Output.object({
                schema: ImportedWorkoutProgramSchema,
            }),
            temperature: 0.3,
        });
        // Estrai testo completo
        const fullText = await result.text;
        if (!fullText || fullText.trim() === '') {
            throw new Error('AI returned empty response');
        }
        // Parse JSON response
        const parsed = parseJsonResponse(fullText);
        // Valida con schema Zod
        const validated = ImportedWorkoutProgramSchema.parse(parsed);
        traceLog('callVisionAI.end', {
            model: modelId,
            durationMs: Date.now() - startTime,
            responseLength: fullText.length,
            usage: result.usage,
        });
        return validated;
    }
    /**
     * Aggiorna configurazione modelli nel database
     */
    static async updateModelConfig(config) {
        const openRouterConfig = await AIProviderConfigService.getConfig('openrouter');
        if (!openRouterConfig) {
            throw new Error('OpenRouter config non trovata');
        }
        const metadata = openRouterConfig.metadata || {};
        const workoutModels = metadata.workoutModels || {};
        if (config.imageExtraction)
            workoutModels.imageExtraction = config.imageExtraction;
        if (config.pdfExtraction)
            workoutModels.pdfExtraction = config.pdfExtraction;
        if (config.documentExtraction)
            workoutModels.documentExtraction = config.documentExtraction;
        if (config.spreadsheetExtraction)
            workoutModels.spreadsheetExtraction = config.spreadsheetExtraction;
        if (config.fallback)
            workoutModels.fallback = config.fallback;
        await prisma.ai_provider_configs.update({
            where: { provider: PROVIDER_MAP.openrouter.enum },
            data: {
                metadata: {
                    ...metadata,
                    workoutModels,
                },
                updatedBy: 'system',
                updatedAt: new Date(),
            },
        });
    }
}

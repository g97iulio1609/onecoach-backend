/**
 * Vision Models Config API
 *
 * GET/PUT /api/admin/vision-models
 * Gestisce configurazione modelli Vision per analisi alimenti
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@onecoach/lib-core/auth/guards';
import { AIProviderConfigService } from '@onecoach/lib-ai';
import { updateVisionModelConfig } from '@onecoach/lib-food';
import { logError, mapErrorToApiResponse } from '@onecoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const openRouterConfig = await AIProviderConfigService.getConfig('openrouter');

    // Se la config OpenRouter non esiste, restituisci default sensati (200)
    if (!openRouterConfig) {
      return NextResponse.json({
        labelExtraction: 'google/gemini-2.5-flash-lite',
        dishSegmentation: 'google/gemini-2.5-flash',
      });
    }

    const metadata = (openRouterConfig.metadata as Record<string, unknown>) || {};
    const visionModels = (metadata.visionModels as Record<string, string>) || {};

    return NextResponse.json({
      labelExtraction: visionModels.labelExtraction || 'google/gemini-2.5-flash-lite',
      dishSegmentation: visionModels.dishSegmentation || 'google/gemini-2.5-flash',
    });
  } catch (error: unknown) {
    logError('Errore nel recupero configurazione', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(_req: NextRequest) {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const body = await _req.json();
    const { labelExtraction, dishSegmentation } = body;

    if (!labelExtraction && !dishSegmentation) {
      return NextResponse.json(
        { error: 'Fornire almeno un modello da aggiornare' },
        { status: 400 }
      );
    }

    await updateVisionModelConfig(labelExtraction, dishSegmentation);

    return NextResponse.json({
      success: true,
      message: 'Configurazione aggiornata',
    });
  } catch (error: unknown) {
    logError("Errore nell'aggiornamento configurazione", error);
    const { response, status } = mapErrorToApiResponse(
      error,
      "Errore nell'aggiornamento configurazione"
    );
    return NextResponse.json(response, { status });
  }
}
